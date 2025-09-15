"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Car, Wrench, AlertTriangle, CheckCircle } from "lucide-react"
import { useVehicleStats } from "@/hooks/use-vehicle-stats"
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor"
import { memo } from "react"

export const OptimizedDashboardOverview = memo(function OptimizedDashboardOverview() {
  const { logPerformance } = usePerformanceMonitor("DashboardOverview")
  const { data: vehicleStats, isLoading, error } = useVehicleStats()

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    console.error("[v0] Dashboard Overview Error:", error)
    return <div className="text-center p-6 text-red-500">Erro ao carregar estatísticas dos veículos</div>
  }

  const stats = [
    {
      title: "Veículos Ativos",
      value: vehicleStats.active,
      description: "Disponíveis para uso",
      icon: Car,
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      title: "Em Manutenção",
      value: vehicleStats.maintenance,
      description: "Indisponíveis temporariamente",
      icon: Wrench,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-700",
    },
    {
      title: "Inativos",
      value: vehicleStats.inactive,
      description: "Fora de serviço",
      icon: AlertTriangle,
      bgColor: "bg-red-100",
      iconColor: "text-red-700",
    },
    {
      title: "Total da Frota",
      value: vehicleStats.total,
      description: "Todos os veículos",
      icon: CheckCircle,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
    },
  ]

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-elevation-4 bg-white dark:bg-slate-800 border-0 shadow-elevation-1"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                <stat.icon size={24} className={stat.iconColor} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {stat.title}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
