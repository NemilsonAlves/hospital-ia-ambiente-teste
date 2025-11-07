'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/30',
    icon: 'text-blue-300',
    border: 'border-blue-400/30',
    glow: 'shadow-blue-500/20'
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500/20 to-green-600/30',
    icon: 'text-emerald-300',
    border: 'border-emerald-400/30',
    glow: 'shadow-emerald-500/20'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/30',
    icon: 'text-amber-300',
    border: 'border-amber-400/30',
    glow: 'shadow-amber-500/20'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-500/20 to-rose-600/30',
    icon: 'text-red-300',
    border: 'border-red-400/30',
    glow: 'shadow-red-500/20'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-violet-600/30',
    icon: 'text-purple-300',
    border: 'border-purple-400/30',
    glow: 'shadow-purple-500/20'
  }
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  color = 'blue' 
}: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <Card className={cn(
      'backdrop-blur-md bg-white/10 border border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/15',
      colors.glow
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">{value}</p>
              {trend && (
                <span className={cn(
                  'text-sm font-medium px-2 py-1 rounded-full backdrop-blur-sm',
                  trend.isPositive 
                    ? 'text-emerald-300 bg-emerald-500/20' 
                    : 'text-red-300 bg-red-500/20'
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-white/60 mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110',
            colors.bg
          )}>
            <div className={cn('w-6 h-6', colors.icon)}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}