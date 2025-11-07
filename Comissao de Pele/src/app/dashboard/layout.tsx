'use client'

import { ReactNode } from 'react'
import { MainLayout } from '@/components/layout/main-layout'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <MainLayout>{children}</MainLayout>
}