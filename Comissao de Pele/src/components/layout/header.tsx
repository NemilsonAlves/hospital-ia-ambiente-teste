'use client'

import { useState } from 'react'
import { Search, Bell, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuthStore()
  const { notifications } = useAppStore()
  
  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <header className="glass-card border-0 border-b border-white/20 px-6 py-4 backdrop-blur-xl bg-white/10 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold gradient-text">Dashboard</h1>
          <p className="text-sm text-gray-600">Visão geral do sistema</p>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80 input-field glass-card bg-white/20 border-white/30 text-gray-700 placeholder:text-gray-500"
            />
          </div>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative glass-card bg-white/20 hover:bg-white/30 border-white/30 text-gray-700 hover:text-gray-900 transition-all duration-300"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon"
            className="glass-card bg-white/20 hover:bg-white/30 border-white/30 text-gray-700 hover:text-gray-900 transition-all duration-300"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/30">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.organization.name}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
              <span className="text-sm font-medium text-white">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}