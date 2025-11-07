'use client'

import { User } from 'lucide-react'
import { ClientOnly } from './client-only'
import { LoginFormClient } from './login-form-client'

export function LoginForm() {
  return (
    <ClientOnly
      fallback={
        <div className="w-full max-w-md mx-auto">
          <div className="glass-effect rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                FAÇA LOGIN
              </h1>
            </div>
            <div className="space-y-6">
              <div className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-2xl animate-pulse h-14"></div>
              <div className="w-full pl-12 pr-12 py-4 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-2xl animate-pulse h-14"></div>
              <div className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-2xl animate-pulse h-14"></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginFormClient />
    </ClientOnly>
  )
}