import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/refresh']

// Rotas protegidas que precisam de autenticação
const protectedRoutes = ['/dashboard', '/analysis', '/patients', '/reports', '/appointments', '/teleconsult', '/inventory', '/settings']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso a arquivos estáticos e API routes públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    publicRoutes.includes(pathname)
  ) {
    return NextResponse.next()
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    // Tentar obter token do cookie ou header
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const payload = await verifyToken(token)
      
      // Adicionar dados do usuário aos headers para uso nas páginas
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-role', payload.role)
      requestHeaders.set('x-organization-id', payload.organizationId)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      // Token inválido, redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}