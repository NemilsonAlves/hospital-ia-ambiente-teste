import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 relative overflow-hidden">
      {/* Formas geométricas de fundo - mais vibrantes como na imagem */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculo laranja/amarelo grande à esquerda */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-yellow-400 via-orange-400 to-pink-400 rounded-full opacity-80 blur-sm"></div>
        
        {/* Círculo roxo no centro */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full opacity-70 blur-lg"></div>
        
        {/* Círculo rosa/vermelho à direita */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-bl from-pink-400 via-red-400 to-purple-500 rounded-full opacity-75 blur-md"></div>
        
        {/* Círculo verde/azul pequeno */}
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tl from-green-400 via-teal-400 to-blue-500 rounded-full opacity-60 blur-lg"></div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 flex min-h-screen">
        {/* Seção de boas-vindas - Desktop */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="text-center space-y-8 max-w-md">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-gray-800 mb-4 tracking-wide">
                BEM VINDO
              </h1>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-700 underline decoration-2 decoration-gray-600">
                  Novo Login
                </h2>
                
                <button className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-8 py-3 rounded-full font-semibold hover:from-orange-500 hover:to-pink-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  Criar conta
                </button>
              </div>
              
              <div className="flex justify-center space-x-4 mt-8">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer shadow-lg">
                  <span className="font-bold text-lg">M</span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer shadow-lg">
                  <span className="font-bold text-lg">W</span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer shadow-lg">
                  <span className="font-bold text-lg">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de login */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}