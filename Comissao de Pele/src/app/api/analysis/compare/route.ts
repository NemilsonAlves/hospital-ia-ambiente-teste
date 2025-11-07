import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withHealthProfessionalAuth } from '@/middleware/auth'
import { compareWoundImages } from '@/lib/ai-analysis'
import { z } from 'zod'

const compareSchema = z.object({
  lesionId: z.string().uuid(),
  beforeImageBase64: z.string(),
  afterImageBase64: z.string(),
  daysBetween: z.number().min(1),
})

async function handleComparison(request: NextRequest) {
  try {
    const body = await request.json()
    const { lesionId, beforeImageBase64, afterImageBase64, daysBetween } = compareSchema.parse(body)

    // Verificar se a lesão existe e se o usuário tem acesso
    const lesion = await prisma.lesion.findFirst({
      where: {
        id: lesionId,
        patient: {
          organizationId: request.user!.organizationId,
        },
      },
    })

    if (!lesion) {
      return NextResponse.json(
        { error: 'Lesão não encontrada' },
        { status: 404 }
      )
    }

    // Realizar comparação IA
    const comparisonResult = await compareWoundImages(
      beforeImageBase64,
      afterImageBase64,
      daysBetween
    )

    // Salvar análise comparativa no banco
    const aiAnalysis = await prisma.aIAnalysis.create({
      data: {
        lesionId,
        analysisType: 'PROGRESS_COMPARISON',
        confidence: 85, // Confiança padrão para comparações
        confidenceLevel: 'HIGH',
        results: {
          healingProgress: comparisonResult.healingProgress,
          progressPercentage: comparisonResult.progressPercentage,
          observations: comparisonResult.observations,
          recommendations: comparisonResult.recommendations,
          daysBetween,
        },
        status: 'COMPLETED',
        processedBy: request.user!.userId,
        processedAt: new Date(),
      },
    })

    // Atualizar lesão com progresso de cicatrização
    await prisma.lesion.update({
      where: { id: lesionId },
      data: {
        healingProgress: comparisonResult.healingProgress,
        updatedAt: new Date(),
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: request.user!.userId,
        organizationId: request.user!.organizationId,
        action: 'AI_COMPARISON',
        resource: 'LESION',
        resourceId: lesionId,
        details: {
          analysisId: aiAnalysis.id,
          healingProgress: comparisonResult.healingProgress,
          progressPercentage: comparisonResult.progressPercentage,
          daysBetween,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
      },
    })

    return NextResponse.json({
      analysisId: aiAnalysis.id,
      ...comparisonResult,
    })
  } catch (error) {
    console.error('Comparison error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro na comparação das imagens' },
      { status: 500 }
    )
  }
}

export const POST = withHealthProfessionalAuth(handleComparison)