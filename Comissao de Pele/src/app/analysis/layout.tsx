'use client'

import { ReactNode } from 'react'
import { MainLayout } from '@/components/layout/main-layout'

interface AnalysisLayoutProps {
  children: ReactNode
}

export default function AnalysisLayout({ children }: AnalysisLayoutProps) {
  return <MainLayout>{children}</MainLayout>
}