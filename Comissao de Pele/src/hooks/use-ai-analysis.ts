'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { WoundAnalysisResult } from '@/lib/ai-analysis'

interface AnalysisRequest {
  lesionId: string
  imageBase64: string
  patientInfo?: {
    age?: number
    diabetes?: boolean
    hypertension?: boolean
    previousWounds?: boolean
  }
}

interface ComparisonRequest {
  lesionId: string
  beforeImageBase64: string
  afterImageBase64: string
  daysBetween: number
}

export const useWoundAnalysis = () => {
  const { accessToken } = useAuthStore()
  const { addNotification } = useAppStore()

  const analysisMutation = useMutation({
    mutationFn: async (data: AnalysisRequest): Promise<WoundAnalysisResult & { analysisId: string }> => {
      const response = await fetch('/api/analysis/wound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro na análise')
      }

      return response.json()
    },
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        title: 'Análise concluída',
        message: `Análise realizada com ${data.confidence}% de confiança`,
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Erro na análise',
        message: error.message,
      })
    },
  })

  const comparisonMutation = useMutation({
    mutationFn: async (data: ComparisonRequest) => {
      const response = await fetch('/api/analysis/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro na comparação')
      }

      return response.json()
    },
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        title: 'Comparação concluída',
        message: `Progresso: ${data.healingProgress === 'IMPROVING' ? 'Melhorando' : 
                              data.healingProgress === 'STABLE' ? 'Estável' : 'Piorando'}`,
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Erro na comparação',
        message: error.message,
      })
    },
  })

  return {
    analyzeWound: analysisMutation.mutate,
    compareWounds: comparisonMutation.mutate,
    isAnalyzing: analysisMutation.isPending,
    isComparing: comparisonMutation.isPending,
    analysisResult: analysisMutation.data,
    comparisonResult: comparisonMutation.data,
    analysisError: analysisMutation.error,
    comparisonError: comparisonMutation.error,
  }
}

export const useAnalysisHistory = (lesionId: string) => {
  const { accessToken } = useAuthStore()

  return useQuery({
    queryKey: ['analysis-history', lesionId],
    queryFn: async () => {
      const response = await fetch(`/api/analysis/history/${lesionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico')
      }

      return response.json()
    },
    enabled: !!lesionId && !!accessToken,
  })
}

// Hook para converter arquivo para base64
export const useImageToBase64 = () => {
  const [isConverting, setIsConverting] = useState(false)

  const convertToBase64 = (file: File): Promise<string> => {
    setIsConverting(true)
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1] // Remove data:image/...;base64,
        setIsConverting(false)
        resolve(base64)
      }
      
      reader.onerror = () => {
        setIsConverting(false)
        reject(new Error('Erro ao converter imagem'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  return {
    convertToBase64,
    isConverting,
  }
}