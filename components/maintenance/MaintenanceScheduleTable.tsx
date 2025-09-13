"use client"

import type { MaintenanceSchedule } from "@/types/database"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Eye, Trash2, Play, CheckCircle } from "lucide-react"
import Link from "next/link"

type MaintenanceScheduleWithRelations = MaintenanceSchedule & {
  vehicle?: {
    license_plate: string
    make: string
    model: string
    current_mileage: number
  } | null
  category?: {
    name: string
    description: string | null
  } | null
  created_by_user?: {
    name: string
  } | null
}

interface MaintenanceScheduleTableProps {
  schedules: MaintenanceScheduleWithRelations[]
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  scheduled: "Agendada",
  in_progress: "Em Progresso",
  completed: "Concluída",
  cancelled: "Cancelada",
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

export function MaintenanceScheduleTable({ schedules }: MaintenanceScheduleTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const isOverdue = (scheduledDate: string, status: string) => {
    return status === "scheduled" && new Date(scheduledDate) < new Date()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manutenções Agendadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Agendada</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Quilometragem</TableHead>
                <TableHead>Custo Estimado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma manutenção agendada.
                    <Link href="/maintenance/schedule" className="text-primary hover:underline ml-1">
                      Agendar a primeira manutenção
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow
                    key={schedule.id}
                    className={isOverdue(schedule.scheduled_date, schedule.status) ? "bg-red-50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {formatDate(schedule.scheduled_date)}
                        {isOverdue(schedule.scheduled_date, schedule.status) && (
                          <Badge variant="destructive" className="text-xs">
                            Atrasada
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {schedule.vehicle ? (
                        <div>
                          <div className="font-medium">{schedule.vehicle.license_plate}</div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.vehicle.make} {schedule.vehicle.model}
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{schedule.category?.name || "Geral"}</TableCell>
                    <TableCell>
                      <Badge className={priorityColors[schedule.priority as keyof typeof priorityColors]}>
                        {priorityLabels[schedule.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[schedule.status]}>{statusLabels[schedule.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {schedule.scheduled_mileage ? `${schedule.scheduled_mileage.toLocaleString()} km` : "N/A"}
                      {schedule.vehicle && (
                        <div className="text-xs text-muted-foreground">
                          Atual: {schedule.vehicle.current_mileage.toLocaleString()} km
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{schedule.estimated_cost ? `€${schedule.estimated_cost.toFixed(2)}` : "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {schedule.status === "scheduled" && (
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {schedule.status === "in_progress" && (
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/maintenance/${schedule.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/maintenance/${schedule.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
