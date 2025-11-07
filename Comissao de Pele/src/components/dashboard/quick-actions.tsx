'use client'

import { Camera, Brain, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const quickActions = [
  {
    title: 'Nova Análise de Ferida',
    description: 'Envie uma foto e receba análise inteligente com recomendações de tratamento',
    icon: Camera,
    href: '/analysis/new',
    gradient: 'from-blue-500 to-cyan-600',
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/30',
    buttonText: 'Iniciar Análise'
  },
  {
    title: 'Assistente IA Clínico',
    description: 'Chat inteligente com protocolos, condutas e orientações especializadas',
    icon: Brain,
    href: '/assistant',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/30',
    buttonText: 'Abrir Chat IA'
  }
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {quickActions.map((action, index) => (
        <Card 
          key={index} 
          className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/15 group"
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:scale-110`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">{action.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 mb-4">{action.description}</p>
            <Link href={action.href}>
              <Button className={`w-full bg-gradient-to-r ${action.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                {action.buttonText}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}