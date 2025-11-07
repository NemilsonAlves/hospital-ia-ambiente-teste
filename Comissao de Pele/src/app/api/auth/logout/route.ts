import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      const payload = verifyToken(token)
      
      if (payload) {
        // Log de auditoria
        await prisma.auditLog.create({
          data: {
            userId: payload.userId,
            organizationId: payload.organizationId,
            action: 'LOGOUT',
            resource: 'USER',
            resourceId: payload.userId,
            details: {
              email: payload.email,
              userAgent: request.headers.get('user-agent'),
            },
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent'),
          },
        })
      }
    }

    const response = NextResponse.json({ message: 'Logout realizado com sucesso' })
    
    // Remover cookie do refresh token
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}