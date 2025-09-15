import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Wrench, AlertTriangle, CheckCircle } from "lucide-react"

interface DashboardOverviewProps {
  vehicleStats: {
    total: number
    active: number
    maintenance: number
    inactive: number
  }
}

export function DashboardOverview({ vehicleStats }: DashboardOverviewProps) {
  const stats = [
    {
      title: "Veículos Ativos",
      value: vehicleStats.active,
      description: "Disponíveis para uso",
      icon: Car,
      color: "success" as const,
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
      badgeVariant: "default" as const,
    },
    {
      title: "Em Manutenção",
      value: vehicleStats.maintenance,
      description: "Indisponíveis temporariamente",
      icon: Wrench,
      color: "warning" as const,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-700",
      badgeVariant: "secondary" as const,
    },
    {
      title: "Inativos",
      value: vehicleStats.inactive,
      description: "Fora de serviço",
      icon: AlertTriangle,
      color: "error" as const,
      bgColor: "bg-red-100",
      iconColor: "text-red-700",
      badgeVariant: "destructive" as const,
    },
    {
      title: "Total da Frota",
      value: vehicleStats.total,
      description: "Todos os veículos",
      icon: CheckCircle,
      color: "info" as const,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
      badgeVariant: "outline" as const,
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
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                <stat.icon size={24} className={stat.iconColor} />
              </div>
              <Badge variant={stat.badgeVariant} className="text-xs">
                {stat.color}
              </Badge>
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
}
