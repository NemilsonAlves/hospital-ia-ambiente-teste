import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload, hasMinimumRole } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options?: {
    requiredRole?: UserRole
    allowedRoles?: UserRole[]
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (!token) {
        return NextResponse.json(
          { error: 'Token de acesso requerido' },
          { status: 401 }
        )
      }

      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json(
          { error: 'Token inválido ou expirado' },
          { status: 401 }
        )
      }

      // Verificar permissões se especificadas
      if (options?.requiredRole && !hasMinimumRole(payload.role, options.requiredRole)) {
        return NextResponse.json(
          { error: 'Permissão insuficiente' },
          { status: 403 }
        )
      }

      if (options?.allowedRoles && !options.allowedRoles.includes(payload.role)) {
        return NextResponse.json(
          { error: 'Permissão insuficiente' },
          { status: 403 }
        )
      }

      // Adicionar dados do usuário à request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = payload

      return handler(authenticatedRequest)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Erro de autenticação' },
        { status: 500 }
      )
    }
  }
}

// Middleware específico para diferentes níveis de acesso
export const withAdminAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { requiredRole: UserRole.ADMIN })

export const withCoordinatorAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { requiredRole: UserRole.COORDINATOR })

export const withDoctorAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { requiredRole: UserRole.DOCTOR })

export const withHealthProfessionalAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { 
    allowedRoles: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.DOCTOR,
      UserRole.SPECIALIST_NURSE,
      UserRole.PHYSIOTHERAPIST,
      UserRole.PHARMACIST,
    ]
  })

export const withPatientAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { allowedRoles: [UserRole.PATIENT] })