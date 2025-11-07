'use client'

import { Users, Brain, TrendingUp, AlertTriangle } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivities } from '@/components/dashboard/recent-activities'

export default function DashboardPage() {
  return (
    <div className="space-y-6"> 
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-fade-in dashboard-stagger-1">
          <StatsCard
            title="Pacientes Ativos"
            value="1,234"
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            subtitle="Pacientes em acompanhamento"
            color="blue"
          />
        </div>
        <div className="dashboard-fade-in dashboard-stagger-2">
          <StatsCard
            title="Análises IA"
            value="856"
            icon={<Brain className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
            subtitle="Análises realizadas este mês"
            color="green"
          />
        </div>
        <div className="dashboard-fade-in dashboard-stagger-3">
          <StatsCard
            title="Taxa de Precisão"
            value="94.2%"
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: 2.1, isPositive: true }}
            subtitle="Precisão das análises"
            color="yellow"
          />
        </div>
        <div className="dashboard-fade-in dashboard-stagger-4">
          <StatsCard
            title="Casos Urgentes"
            value="23"
            icon={<AlertTriangle className="w-6 h-6" />}
            trend={{ value: 5, isPositive: false }}
            subtitle="Requerem atenção imediata"
            color="red"
          />
        </div>
      </div>

      {/* Quick Actions and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-fade-in dashboard-stagger-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Ações Rápidas</h2>
            <p className="text-white/60 text-sm">Acesso rápido às principais funcionalidades</p>
          </div>
          <QuickActions />
        </div>
        <div className="dashboard-fade-in dashboard-stagger-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Atividades Recentes</h2>
            <p className="text-white/60 text-sm">Últimas ações realizadas no sistema</p>
          </div>
          <RecentActivities />
        </div>
      </div>
    </div>
  )
}