import { Card } from "primereact/card"
import { Tag } from "primereact/tag"
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
      color: "success",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Em Manutenção",
      value: vehicleStats.maintenance,
      description: "Indisponíveis temporariamente",
      icon: Wrench,
      color: "warning",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Inativos",
      value: vehicleStats.inactive,
      description: "Fora de serviço",
      icon: AlertTriangle,
      color: "danger",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Total da Frota",
      value: vehicleStats.total,
      description: "Todos os veículos",
      icon: CheckCircle,
      color: "info",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <Tag value={stat.color} severity={stat.color as any} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{stat.title}</h3>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
