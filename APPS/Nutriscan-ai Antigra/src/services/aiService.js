import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa a API do Gemini
// Certifique-se de criar um arquivo .env na raiz do projeto com: VITE_GEMINI_API_KEY=sua_chave_aqui
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const analyzeImageWithGemini = async (imageBlob) => {
  if (!API_KEY) {
    throw new Error("API Key do Gemini não encontrada. Verifique o arquivo .env");
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Usando o modelo Gemini 2.0 Flash (disponível para sua chave)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Converte o Blob para base64
    const base64Data = await blobToGenerativePart(imageBlob);

    const prompt = `
      Analise esta imagem de comida e retorne APENAS um objeto JSON (sem markdown, sem aspas triplas) com a seguinte estrutura:
      {
        "foodName": "Nome do prato principal",
        "calories": 0, // estimativa calórica total
        "macros": {
          "proteins": 0, // gramas
          "carbs": 0, // gramas
          "fats": 0, // gramas
          "fiber": 0, // gramas
          "sugar": 0 // gramas
        },
        "micronutrients": {
          "vitaminA": 0, // porcentagem do valor diário
          "vitaminC": 0, // porcentagem do valor diário
          "iron": 0, // porcentagem do valor diário
          "calcium": 0 // porcentagem do valor diário
        },
        "glycemicIndex": {
          "value": 0, // valor estimado
          "level": "Baixo/Médio/Alto" // classificação
        },
        "tags": ["Tag1", "Tag2"], // ex: "Low Carb", "Rico em Proteína", "Vegano", "Sem Glúten"
        "ingredients": [
          { "name": "Ingrediente 1", "amount": "quantidade estimada" },
          { "name": "Ingrediente 2", "amount": "quantidade estimada" }
        ],
        "healthScore": 0, // 0 a 100 baseado no valor nutricional
        "recommendations": [
          "Ponto positivo ou negativo 1",
          "Ponto positivo ou negativo 2",
          "Ponto positivo ou negativo 3",
          "Ponto positivo ou negativo 4"
        ]
      }
      Se não for comida, retorne um JSON com erro: { "error": "Não foi possível identificar comida na imagem." }
    `;

    const result = await model.generateContent([prompt, base64Data]);
    const response = await result.response;
    const text = response.text();

    console.log("Raw AI Response:", text); // Debug log

    try {
      // Limpeza básica para garantir que é um JSON válido
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError);
      console.error("Texto recebido:", text);
      throw new Error("A IA não retornou um formato válido. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro na análise com Gemini:", error);

    // Melhora a mensagem de erro para o usuário
    if (error.message.includes("API key")) {
      throw new Error("Chave de API inválida ou ausente. Verifique o arquivo .env");
    } else if (error.message.includes("403")) {
      throw new Error("Acesso negado. Verifique se sua API Key é válida e tem permissões.");
    } else if (error.message.includes("Failed to fetch")) {
      throw new Error("Erro de conexão. Verifique sua internet ou se o bloqueador de anúncios está interferindo.");
    }

    throw error;
  }
};

// Função auxiliar para converter Blob/File para o formato aceito pelo Gemini
async function blobToGenerativePart(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: blob.type || "image/jpeg",
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
