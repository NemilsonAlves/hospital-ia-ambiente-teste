'use client'

import { WoundAnalyzer } from '@/components/analysis/wound-analyzer'

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Análise de Feridas</h1>
        <p className="text-gray-600 mt-1">
          Faça upload de uma imagem de ferida para análise com IA
        </p>
      </div>
      
      <WoundAnalyzer />
    </div>
  )
}