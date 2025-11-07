'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, User, Brain, Calendar, FileText } from 'lucide-react'

interface RecentActivity {
  id: string
  type: 'analysis' | 'patient' | 'appointment' | 'report'
  title: string
  description: string
  timestamp: Date
  user: string
  confidence?: number
}

const activityIcons = {
  analysis: Brain,
  patient: User,
  appointment: Calendar,
  report: FileText
}

const activityColors = {
  analysis: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/30 text-blue-300 border-blue-400/30',
  patient: 'bg-gradient-to-br from-emerald-500/20 to-green-600/30 text-emerald-300 border-emerald-400/30',
  appointment: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/30 text-amber-300 border-amber-400/30',
  report: 'bg-gradient-to-br from-purple-500/20 to-violet-600/30 text-purple-300 border-purple-400/30'
}

// Mock data - em produção viria da API
const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'analysis',
    title: 'João Silva',
    description: 'Análise de ferida concluída',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    user: 'Dr. Maria Santos',
    confidence: 96
  },
  {
    id: '2',
    type: 'patient',
    title: 'Maria Santos',
    description: 'Nova avaliação agendada',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    user: 'Enf. Pedro Costa'
  },
  {
    id: '3',
    type: 'analysis',
    title: 'Pedro Costa',
    description: 'Comparação de evolução',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
    user: 'Dr. Ana Silva',
    confidence: 89
  },
  {
    id: '4',
    type: 'appointment',
    title: 'Consulta Agendada',
    description: 'Paciente: Carlos Oliveira',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    user: 'Recepção'
  }
]

export function RecentActivities() {
  const [activities, setActivities] = useState<RecentActivity[]>([])

  useEffect(() => {
    // Em produção, fazer fetch da API
    setActivities(mockActivities)
  }, [])

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null
    
    let color = 'bg-white/10 text-white/60 border-white/20'
    if (confidence >= 90) color = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
    else if (confidence >= 70) color = 'bg-amber-500/20 text-amber-300 border-amber-400/30'
    else color = 'bg-red-500/20 text-red-300 border-red-400/30'

    return (
      <Badge variant="secondary" className={`${color} backdrop-blur-sm border`}>
        Confiança: {confidence}%
      </Badge>
    )
  }

  return (
    <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="w-5 h-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-300 group-hover:scale-110 ${activityColors[activity.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.title}
                    </p>
                    <span className="text-xs text-white/60">
                      {formatDistanceToNow(activity.timestamp, { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white/70 mb-2">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">
                      por {activity.user}
                    </span>
                    {getConfidenceBadge(activity.confidence)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}