'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, User, Lock, Facebook, Instagram, MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { UserRole } from '@prisma/client'

const loginSchema = z.object({
  email: z.string().min(1, 'Campo obrigatório'),
  password: z.string().min(1, 'Campo obrigatório'),
})

type LoginFormData = z.infer<typeof loginSchema>

// Dados de demonstração para diferentes perfis
const demoUsers = {
  admin: { 
    email: 'admin@demo.com', 
    password: 'admin123', 
    name: 'Administrador', 
    role: UserRole.ADMIN,
    id: 'demo-admin-id',
    organization: {
      id: 'demo-org-id',
      name: 'Organização Demo',
      logo: undefined
    }
  },
  user: { 
    email: 'user@demo.com', 
    password: 'user123', 
    name: 'Usuário Padrão', 
    role: UserRole.DOCTOR,
    id: 'demo-user-id',
    organization: {
      id: 'demo-org-id',
      name: 'Organização Demo',
      logo: undefined
    }
  },
  guest: { 
    email: 'guest@demo.com', 
    password: 'guest123', 
    name: 'Convidado', 
    role: UserRole.VISITOR,
    id: 'demo-guest-id',
    organization: {
      id: 'demo-org-id',
      name: 'Organização Demo',
      logo: undefined
    }
  }
}

export function LoginFormClient() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()
  const { addNotification } = useAppStore()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const handleDemoLogin = (userType: keyof typeof demoUsers) => {
    const user = demoUsers[userType]
    setValue('email', user.email)
    setValue('password', user.password)
    setIsDemoMode(true)
    
    // Simular login automático
    setTimeout(() => {
      login(user, 'demo-token')
      addNotification({
        type: 'success',
        title: 'Modo Demo Ativado',
        message: `Bem-vindo(a), ${user.name}! Você está no modo demonstração.`,
      })
      router.push('/dashboard')
    }, 1000)
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    console.log('Login attempt with:', { email: data.email, password: data.password })
    
    try {
      // Verificar se é um usuário demo
      const demoUser = Object.values(demoUsers).find(
        user => user.email === data.email && user.password === data.password
      )

      if (demoUser) {
        // Login demo bem-sucedido
        login(demoUser, 'demo-token')
        addNotification({
          type: 'success',
          title: 'Login realizado com sucesso!',
          message: `Bem-vindo(a), ${demoUser.name}!`,
        })
        router.push('/dashboard')
        return
      }

      // Simular chamada de API para usuários reais
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        login(result.user, result.token)
        addNotification({
          type: 'success',
          title: 'Login realizado com sucesso!',
          message: `Bem-vindo(a), ${result.user.name}!`,
        })
        router.push('/dashboard')
      } else {
        const error = await response.json()
        addNotification({
          type: 'error',
          title: 'Erro no login',
          message: error.message || 'Credenciais inválidas',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      addNotification({
        type: 'error',
        title: 'Erro no login',
        message: 'Erro interno do servidor. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Indicador de modo demo */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl text-center text-sm font-medium shadow-lg">
          🎭 Modo Demonstração Ativo
        </div>
      )}

      {/* Card principal - design mais limpo como na imagem */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-wide">
            FAÇA LOGIN
          </h1>
          <div className="flex justify-center">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium bg-purple-100 hover:bg-purple-200 px-6 py-2 rounded-full transition-all duration-300 shadow-sm"
            >
              Logar
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo de usuário */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              {...register('email')}
              type="text"
              placeholder="USUÁRIO"
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 font-medium hover:bg-white hover:border-gray-300"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-2 ml-2">{errors.email.message}</p>
            )}
          </div>

          {/* Campo de senha */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 font-medium hover:bg-white hover:border-gray-300"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-2 ml-2">{errors.password.message}</p>
            )}
          </div>

          {/* Lembrar e esqueceu senha */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-600 font-medium">Lembrar</span>
            </label>
            <button
              type="button"
              className="text-purple-600 hover:text-purple-800 font-medium underline transition-colors"
            >
              Esqueceu senha?
            </button>
          </div>

          {/* Botão de login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-2xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Redes sociais - design mais limpo */}
        <div className="mt-8">
          <div className="flex justify-center space-x-4">
            <button className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
              <Facebook className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
              <Instagram className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modo Demo - versão compacta */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-inner">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">🎭 Modo Demonstração</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('admin')}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Admin
            </button>
            <button
              onClick={() => handleDemoLogin('user')}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Usuário
            </button>
            <button
              onClick={() => handleDemoLogin('guest')}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Convidado
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}