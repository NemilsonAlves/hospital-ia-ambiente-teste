import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, signToken, generateRefreshToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token não encontrado' },
        { status: 401 }
      )
    }

    const payload = verifyToken(refreshToken)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Refresh token inválido' },
        { status: 401 }
      )
    }

    // Buscar usuário atualizado
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        organization: true,
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo' },
        { status: 401 }
      )
    }

    // Gerar novos tokens
    const newAccessToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    })

    const newRefreshToken = generateRefreshToken(user.id)

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          logo: user.organization.logo,
        },
      },
      accessToken: newAccessToken,
    })

    // Atualizar cookie do refresh token
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    })

    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}