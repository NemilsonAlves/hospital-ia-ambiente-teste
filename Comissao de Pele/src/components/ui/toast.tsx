'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useAppStore } from '@/store/app'
import { cn } from '@/lib/utils'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: 'bg-green-500 border-green-600',
  error: 'bg-red-500 border-red-600',
  warning: 'bg-yellow-500 border-yellow-600',
  info: 'bg-blue-500 border-blue-600',
}

export function Toaster() {
  const { notifications, removeNotification } = useAppStore()

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    notifications.forEach((notification) => {
      if (!notification.read) {
        const timer = setTimeout(() => {
          removeNotification(notification.id)
        }, 5000)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, removeNotification])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.slice(0, 5).map((notification) => {
        const Icon = iconMap[notification.type]
        const colorClass = colorMap[notification.type]

        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm',
              'animate-in slide-in-from-right-full duration-300',
              'max-w-sm w-full',
              colorClass,
              'text-white'
            )}
          >
            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}