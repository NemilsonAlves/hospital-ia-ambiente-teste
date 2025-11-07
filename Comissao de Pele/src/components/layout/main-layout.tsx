'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useAppStore } from '@/store/app'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useAppStore()

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative overflow-hidden">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="geometric-shape absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
        <div className="geometric-shape absolute top-1/3 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-lg"></div>
        <div className="geometric-shape absolute -bottom-16 left-1/3 w-48 h-48 bg-gradient-to-br from-pink-400/15 to-blue-400/15 rounded-full blur-2xl"></div>
      </div>

      <Sidebar />
      
      <div className={cn(
        'flex-1 flex flex-col overflow-hidden transition-all duration-300 relative z-10',
        sidebarCollapsed ? 'ml-0' : 'ml-0'
      )}>
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}