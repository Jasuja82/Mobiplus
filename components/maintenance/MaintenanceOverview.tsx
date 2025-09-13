import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, CheckCircle, Wrench } from "lucide-react"

interface MaintenanceOverviewProps {
  stats: {
    scheduled: number
    overdue: number
    completed: number
  }
}

export function MaintenanceOverview({ stats }: MaintenanceOverviewProps) {
  const overviewStats = [
    {
      title: "Agendadas",
      value: stats.scheduled,
      description: "Manutenções programadas",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Em Atraso",
      value: stats.overdue,
      description: "Manutenções atrasadas",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Concluídas (Mês)",
      value: stats.completed,
      description: "Manutenções finalizadas",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Total Ativo",
      value: stats.scheduled + stats.overdue,
      description: "Manutenções pendentes",
      icon: Wrench,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {overviewStats.map((stat) => (
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
