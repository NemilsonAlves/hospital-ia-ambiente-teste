import OpenAI from 'openai'
import { WoundType, WoundStage, TissueType, ExudateAmount, ExudateType, ConfidenceLevel } from '@prisma/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface WoundAnalysisResult {
  woundType: WoundType
  woundStage: WoundStage
  tissueType: TissueType[]
  exudateAmount: ExudateAmount
  exudateType: ExudateType
  dimensions: {
    length: number
    width: number
    depth?: number
    area: number
  }
  confidence: number
  confidenceLevel: ConfidenceLevel
  observations: string
  recommendations: string[]
  riskFactors: string[]
  healingProgress?: 'IMPROVING' | 'STABLE' | 'DETERIORATING'
}

export interface AnalysisPrompt {
  systemPrompt: string
  userPrompt: string
}

const createAnalysisPrompt = (
  imageBase64: string,
  patientInfo?: {
    age?: number
    diabetes?: boolean
    hypertension?: boolean
    previousWounds?: boolean
  }
): AnalysisPrompt => {
  const systemPrompt = `Você é um especialista em análise de feridas com vasta experiência clínica. 
Analise a imagem da ferida fornecida e forneça uma avaliação detalhada seguindo rigorosamente o formato JSON especificado.

IMPORTANTE: Responda APENAS com um objeto JSON válido, sem texto adicional.

Formato de resposta obrigatório:
{
  "woundType": "PRESSURE_ULCER" | "DIABETIC_ULCER" | "VENOUS_ULCER" | "ARTERIAL_ULCER" | "SURGICAL_WOUND" | "TRAUMATIC_WOUND" | "BURN" | "OTHER",
  "woundStage": "STAGE_1" | "STAGE_2" | "STAGE_3" | "STAGE_4" | "UNSTAGEABLE" | "SUSPECTED_DTI",
  "tissueType": ["GRANULATION", "SLOUGH", "ESCHAR", "EPITHELIAL", "NECROTIC"],
  "exudateAmount": "NONE" | "MINIMAL" | "MODERATE" | "HEAVY",
  "exudateType": "SEROUS" | "SEROSANGUINEOUS" | "SANGUINEOUS" | "PURULENT" | "NONE",
  "dimensions": {
    "length": number,
    "width": number,
    "depth": number,
    "area": number
  },
  "confidence": number (0-100),
  "confidenceLevel": "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW",
  "observations": "string detalhada",
  "recommendations": ["array", "de", "recomendações"],
  "riskFactors": ["array", "de", "fatores", "de", "risco"],
  "healingProgress": "IMPROVING" | "STABLE" | "DETERIORATING"
}`

  const patientContext = patientInfo ? `
Informações do paciente:
- Idade: ${patientInfo.age || 'não informada'}
- Diabetes: ${patientInfo.diabetes ? 'sim' : 'não'}
- Hipertensão: ${patientInfo.hypertension ? 'sim' : 'não'}
- Histórico de feridas: ${patientInfo.previousWounds ? 'sim' : 'não'}
` : ''

  const userPrompt = `Analise esta imagem de ferida e forneça uma avaliação completa.
${patientContext}

Considere:
1. Tipo e estágio da ferida
2. Tipos de tecido presentes
3. Quantidade e tipo de exsudato
4. Dimensões aproximadas (em cm)
5. Sinais de infecção ou complicações
6. Progresso de cicatrização
7. Fatores de risco identificáveis
8. Recomendações de tratamento

Seja preciso na classificação e forneça um nível de confiança baseado na qualidade da imagem e clareza dos achados.`

  return { systemPrompt, userPrompt }
}

export const analyzeWoundImage = async (
  imageBase64: string,
  patientInfo?: {
    age?: number
    diabetes?: boolean
    hypertension?: boolean
    previousWounds?: boolean
  }
): Promise<WoundAnalysisResult> => {
  try {
    const { systemPrompt, userPrompt } = createAnalysisPrompt(imageBase64, patientInfo)

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL_DEFAULT || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.1, // Baixa temperatura para respostas mais consistentes
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia da API de IA')
    }

    // Parse da resposta JSON
    const analysisResult = JSON.parse(content) as WoundAnalysisResult

    // Validação básica dos dados
    if (!analysisResult.woundType || !analysisResult.woundStage) {
      throw new Error('Resposta da IA incompleta')
    }

    // Determinar nível de confiança baseado no score
    if (analysisResult.confidence >= 90) {
      analysisResult.confidenceLevel = ConfidenceLevel.VERY_HIGH
    } else if (analysisResult.confidence >= 75) {
      analysisResult.confidenceLevel = ConfidenceLevel.HIGH
    } else if (analysisResult.confidence >= 60) {
      analysisResult.confidenceLevel = ConfidenceLevel.MEDIUM
    } else {
      analysisResult.confidenceLevel = ConfidenceLevel.LOW
    }

    return analysisResult
  } catch (error) {
    console.error('Erro na análise de IA:', error)
    throw new Error('Falha na análise da imagem. Tente novamente.')
  }
}

export const compareWoundImages = async (
  beforeImageBase64: string,
  afterImageBase64: string,
  daysBetween: number
): Promise<{
  healingProgress: 'IMPROVING' | 'STABLE' | 'DETERIORATING'
  progressPercentage: number
  observations: string
  recommendations: string[]
}> => {
  try {
    const systemPrompt = `Você é um especialista em cicatrização de feridas. Compare duas imagens da mesma ferida tiradas em momentos diferentes e avalie o progresso de cicatrização.

Responda APENAS com um objeto JSON válido:
{
  "healingProgress": "IMPROVING" | "STABLE" | "DETERIORATING",
  "progressPercentage": number (-100 a 100),
  "observations": "string detalhada",
  "recommendations": ["array", "de", "recomendações"]
}`

    const userPrompt = `Compare estas duas imagens da mesma ferida:
- Primeira imagem: estado anterior
- Segunda imagem: estado atual (${daysBetween} dias depois)

Avalie:
1. Mudanças no tamanho da ferida
2. Alterações nos tipos de tecido
3. Mudanças no exsudato
4. Sinais de cicatrização ou deterioração
5. Progresso geral (porcentagem: -100 = muito pior, 0 = sem mudança, +100 = completamente cicatrizada)`

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL_DEFAULT || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${beforeImageBase64}`,
                detail: 'high',
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${afterImageBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia da API de IA')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Erro na comparação de imagens:', error)
    throw new Error('Falha na comparação das imagens. Tente novamente.')
  }
}