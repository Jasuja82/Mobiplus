import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import Link from "next/link"

interface MaintenanceSchedule {
  id: string
  scheduled_date: string
  priority: number
  vehicle?: {
    license_plate: string
    make: string
    model: string
  } | null
}

interface UpcomingMaintenanceProps {
  schedules: MaintenanceSchedule[]
}

const priorityColors = {
  1: "bg-green-100 text-green-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-orange-100 text-orange-800",
  4: "bg-red-100 text-red-800",
}

const priorityLabels = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
  4: "Urgente",
}

export function UpcomingMaintenance({ schedules }: UpcomingMaintenanceProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Próximas Manutenções</CardTitle>
        <Link href="/maintenance" className="text-sm text-primary hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma manutenção agendada</p>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {schedule.vehicle?.license_plate} - {schedule.vehicle?.make} {schedule.vehicle?.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(schedule.scheduled_date)}</p>
                  </div>
                </div>
                <Badge className={priorityColors[schedule.priority as keyof typeof priorityColors]}>
                  {priorityLabels[schedule.priority as keyof typeof priorityLabels]}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
