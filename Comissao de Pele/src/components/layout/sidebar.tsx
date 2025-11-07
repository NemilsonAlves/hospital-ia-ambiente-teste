'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  Calendar, 
  MessageSquare, 
  Package, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: 'Pacientes',
    href: '/patients',
    icon: Users,
    current: false,
  },
  {
    name: 'Análise IA',
    href: '/analysis',
    icon: Brain,
    current: false,
  },
  {
    name: 'Relatórios Clínicos',
    href: '/reports',
    icon: Calendar,
    current: false,
  },
  {
    name: 'Agendamentos',
    href: '/appointments',
    icon: Calendar,
    current: false,
  },
  {
    name: 'Teleconsulta',
    href: '/teleconsult',
    icon: MessageSquare,
    current: false,
  },
  {
    name: 'Estoque',
    href: '/inventory',
    icon: Package,
    current: false,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
    current: false,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebarCollapsed } = useAppStore()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className={cn(
      'flex flex-col h-screen glass-card bg-white/10 backdrop-blur-xl border-r border-white/20 transition-all duration-300 shadow-xl',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold gradient-text">Central de Pele</h1>
              <p className="text-xs text-gray-600">Pro IA</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="h-8 w-8 glass-card bg-white/20 hover:bg-white/30 border-white/30 text-gray-700 hover:text-gray-900"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                isActive
                  ? 'glass-card bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border border-purple-300/30 shadow-lg'
                  : 'text-gray-700 hover:glass-card hover:bg-white/20 hover:text-gray-900 hover:shadow-md'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 transition-colors duration-300', 
                isActive ? 'text-purple-600' : 'text-gray-500'
              )} />
              {!sidebarCollapsed && (
                <span className={cn(
                  'transition-colors duration-300',
                  isActive ? 'text-purple-700 font-semibold' : 'text-gray-700'
                )}>{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/20">
        {!sidebarCollapsed && user && (
          <div className="mb-3">
            <div className="flex items-center gap-3 p-3 glass-card bg-white/10 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:glass-card hover:bg-red-50/50 transition-all duration-300',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed && 'Sair'}
        </Button>
      </div>
    </div>
  )
}