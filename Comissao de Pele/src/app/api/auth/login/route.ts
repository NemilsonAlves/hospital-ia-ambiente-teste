import { NextRequest, NextResponse } from 'next/server'
import { signToken, generateRefreshToken } from '@/lib/auth'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

// Usuários demo (mesmos do frontend)
const demoUsers = {
  admin: {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Administrador Demo',
    role: UserRole.ADMIN,
    avatar: null,
    isActive: true,
    organization: {
      id: 'demo-org-1',
      name: 'Clínica Demo',
      logo: null,
    },
  },
  user: {
    id: 'demo-user-1',
    email: 'user@demo.com',
    password: 'user123',
    name: 'Médico Demo',
    role: UserRole.DOCTOR,
    avatar: null,
    isActive: true,
    organization: {
      id: 'demo-org-1',
      name: 'Clínica Demo',
      logo: null,
    },
  },
  guest: {
    id: 'demo-guest-1',
    email: 'guest@demo.com',
    password: 'guest123',
    name: 'Visitante Demo',
    role: UserRole.VISITOR,
    avatar: null,
    isActive: true,
    organization: {
      id: 'demo-org-1',
      name: 'Clínica Demo',
      logo: null,
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Buscar usuário demo
    const demoUser = Object.values(demoUsers).find(
      user => user.email === email && user.password === password
    )

    if (!demoUser) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Use as credenciais demo disponíveis.' },
        { status: 401 }
      )
    }

    // Gerar tokens
    const accessToken = signToken({
      userId: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
      organizationId: demoUser.organization.id,
    })

    const refreshToken = generateRefreshToken(demoUser.id)

    const response = NextResponse.json({
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        avatar: demoUser.avatar,
        organization: {
          id: demoUser.organization.id,
          name: demoUser.organization.name,
          logo: demoUser.organization.logo,
        },
      },
      accessToken,
    })

    // Definir cookie httpOnly para refresh token
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}