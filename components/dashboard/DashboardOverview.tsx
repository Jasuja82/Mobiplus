import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      color: "text-green-600",
    },
    {
      title: "Em Manutenção",
      value: vehicleStats.maintenance,
      description: "Indisponíveis temporariamente",
      icon: Wrench,
      color: "text-yellow-600",
    },
    {
      title: "Inativos",
      value: vehicleStats.inactive,
      description: "Fora de serviço",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Total da Frota",
      value: vehicleStats.total,
      description: "Todos os veículos",
      icon: CheckCircle,
      color: "text-blue-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
