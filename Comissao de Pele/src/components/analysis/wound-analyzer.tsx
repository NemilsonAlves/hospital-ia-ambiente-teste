'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, Brain, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useWoundAnalysis, useImageToBase64 } from '@/hooks/use-ai-analysis'
import { getConfidenceLevelColor, getConfidenceLevelText } from '@/lib/utils'
import { WoundAnalysisResult } from '@/lib/ai-analysis'

interface WoundAnalyzerProps {
  lesionId: string
  patientInfo?: {
    age?: number
    diabetes?: boolean
    hypertension?: boolean
    previousWounds?: boolean
  }
  onAnalysisComplete?: (result: WoundAnalysisResult & { analysisId: string }) => void
}

export function WoundAnalyzer({ lesionId, patientInfo, onAnalysisComplete }: WoundAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const { analyzeWound, isAnalyzing, analysisResult, analysisError } = useWoundAnalysis()
  const { convertToBase64, isConverting } = useImageToBase64()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedImage(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleAnalysis = async () => {
    if (!selectedImage) return

    try {
      const imageBase64 = await convertToBase64(selectedImage)
      
      analyzeWound({
        lesionId,
        imageBase64,
        patientInfo,
      })
    } catch (error) {
      console.error('Erro ao converter imagem:', error)
    }
  }

  const resetAnalysis = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  // Callback quando análise é concluída
  if (analysisResult && onAnalysisComplete) {
    onAnalysisComplete(analysisResult)
  }

  return (
    <div className="space-y-6">
      {/* Upload de Imagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Análise de Ferida com IA
          </CardTitle>
          <CardDescription>
            Faça upload de uma imagem da ferida para análise automática
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!imagePreview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
              </p>
              <p className="text-sm text-gray-500">
                Formatos aceitos: JPEG, PNG, WebP (máx. 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview da ferida"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
              
              <div className="flex justify-center gap-2">
                <Button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing || isConverting}
                  loading={isAnalyzing || isConverting}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetAnalysis}
                  disabled={isAnalyzing || isConverting}
                >
                  Nova Imagem
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Análise */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultado da Análise IA
            </CardTitle>
            <CardDescription>
              Análise realizada com {analysisResult.confidence}% de confiança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nível de Confiança */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Confiança:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceLevelColor(analysisResult.confidence)}`}>
                {getConfidenceLevelText(analysisResult.confidence)} ({analysisResult.confidence}%)
              </span>
            </div>

            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Classificação</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Tipo:</span> {analysisResult.woundType}</p>
                  <p><span className="font-medium">Estágio:</span> {analysisResult.woundStage}</p>
                  <p><span className="font-medium">Tecidos:</span> {analysisResult.tissueType.join(', ')}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Exsudato</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Quantidade:</span> {analysisResult.exudateAmount}</p>
                  <p><span className="font-medium">Tipo:</span> {analysisResult.exudateType}</p>
                </div>
              </div>
            </div>

            {/* Dimensões */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dimensões (cm)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Comprimento:</span> {analysisResult.dimensions.length}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Largura:</span> {analysisResult.dimensions.width}
                </div>
                {analysisResult.dimensions.depth && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium">Profundidade:</span> {analysisResult.dimensions.depth}
                  </div>
                )}
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Área:</span> {analysisResult.dimensions.area} cm²
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {analysisResult.observations}
              </p>
            </div>

            {/* Recomendações */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recomendações</h4>
              <ul className="space-y-1">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fatores de Risco */}
            {analysisResult.riskFactors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Fatores de Risco
                </h4>
                <ul className="space-y-1">
                  {analysisResult.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">⚠</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Erro na Análise */}
      {analysisError && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erro na análise:</span>
              <span>{analysisError.message}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}