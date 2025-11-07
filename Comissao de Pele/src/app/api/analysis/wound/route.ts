import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withHealthProfessionalAuth } from '@/middleware/auth'
import { analyzeWoundImage } from '@/lib/ai-analysis'
import { z } from 'zod'

const analysisSchema = z.object({
  lesionId: z.string().uuid(),
  imageBase64: z.string(),
  patientInfo: z.object({
    age: z.number().optional(),
    diabetes: z.boolean().optional(),
    hypertension: z.boolean().optional(),
    previousWounds: z.boolean().optional(),
  }).optional(),
})

async function handleAnalysis(request: NextRequest) {
  try {
    const body = await request.json()
    const { lesionId, imageBase64, patientInfo } = analysisSchema.parse(body)

    // Verificar se a lesão existe e se o usuário tem acesso
    const lesion = await prisma.lesion.findFirst({
      where: {
        id: lesionId,
        patient: {
          organizationId: request.user!.organizationId,
        },
      },
      include: {
        patient: true,
      },
    })

    if (!lesion) {
      return NextResponse.json(
        { error: 'Lesão não encontrada' },
        { status: 404 }
      )
    }

    // Realizar análise IA
    const analysisResult = await analyzeWoundImage(
      imageBase64,
      patientInfo || {
        age: lesion.patient.birthDate ? 
          new Date().getFullYear() - new Date(lesion.patient.birthDate).getFullYear() : 
          undefined,
        diabetes: lesion.patient.medicalHistory?.diabetes,
        hypertension: lesion.patient.medicalHistory?.hypertension,
        previousWounds: lesion.patient.medicalHistory?.previousWounds,
      }
    )

    // Salvar análise no banco
    const aiAnalysis = await prisma.aIAnalysis.create({
      data: {
        lesionId,
        analysisType: 'WOUND_ASSESSMENT',
        confidence: analysisResult.confidence,
        confidenceLevel: analysisResult.confidenceLevel,
        results: {
          woundType: analysisResult.woundType,
          woundStage: analysisResult.woundStage,
          tissueType: analysisResult.tissueType,
          exudateAmount: analysisResult.exudateAmount,
          exudateType: analysisResult.exudateType,
          dimensions: analysisResult.dimensions,
          observations: analysisResult.observations,
          recommendations: analysisResult.recommendations,
          riskFactors: analysisResult.riskFactors,
          healingProgress: analysisResult.healingProgress,
        },
        status: 'COMPLETED',
        processedBy: request.user!.userId,
        processedAt: new Date(),
      },
    })

    // Atualizar lesão com dados da análise se confiança for alta
    if (analysisResult.confidence >= (parseInt(process.env.AI_CONFIDENCE_THRESHOLD || '75'))) {
      await prisma.lesion.update({
        where: { id: lesionId },
        data: {
          woundType: analysisResult.woundType,
          stage: analysisResult.woundStage,
          length: analysisResult.dimensions.length,
          width: analysisResult.dimensions.width,
          depth: analysisResult.dimensions.depth,
          area: analysisResult.dimensions.area,
          updatedAt: new Date(),
        },
      })
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: request.user!.userId,
        organizationId: request.user!.organizationId,
        action: 'AI_ANALYSIS',
        resource: 'LESION',
        resourceId: lesionId,
        details: {
          analysisId: aiAnalysis.id,
          confidence: analysisResult.confidence,
          woundType: analysisResult.woundType,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
      },
    })

    return NextResponse.json({
      analysisId: aiAnalysis.id,
      ...analysisResult,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro na análise da imagem' },
      { status: 500 }
    )
  }
}

export const POST = withHealthProfessionalAuth(handleAnalysis)