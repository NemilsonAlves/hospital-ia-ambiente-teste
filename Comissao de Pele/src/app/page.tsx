'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Se o usuário está autenticado e não está no dashboard, redireciona
        if (pathname !== '/dashboard') {
          router.push('/dashboard')
        }
      } else {
        // Se o usuário não está autenticado e não está na página de login, redireciona
        if (pathname !== '/login') {
          router.push('/login')
        }
      }
    }
  }, [user, isLoading, router, pathname])

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Carregando...</p>
      </div>
    </div>
  )
}
