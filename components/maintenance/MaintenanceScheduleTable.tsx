"use client"

import { useMemo, useState } from "react"
import type { MaintenanceSchedule } from "@/types/database"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Eye, Trash2, Play, CheckCircle, Search, Filter } from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [overdueFilter, setOverdueFilter] = useState<string>("all")

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesSearch =
        searchTerm === "" ||
        schedule.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${schedule.vehicle?.make} ${schedule.vehicle?.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || schedule.status === statusFilter
      const matchesPriority = priorityFilter === "all" || schedule.priority.toString() === priorityFilter
      const matchesCategory = categoryFilter === "all" || schedule.category?.name === categoryFilter

      const isScheduleOverdue = isOverdue(schedule.scheduled_date, schedule.status)
      const matchesOverdue =
        overdueFilter === "all" ||
        (overdueFilter === "overdue" && isScheduleOverdue) ||
        (overdueFilter === "not_overdue" && !isScheduleOverdue)

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesOverdue
    })
  }, [schedules, searchTerm, statusFilter, priorityFilter, categoryFilter, overdueFilter])

  const uniqueCategories = useMemo(() => {
    const categories = schedules
      .map((s) => s.category?.name)
      .filter((cat, index, self) => cat && self.indexOf(cat) === index)
    return categories
  }, [schedules])

  const formatDate = useMemo(() => {
    return (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString("pt-PT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      } catch {
        return "Data inválida"
      }
    }
  }, [])

  const isOverdue = useMemo(() => {
    return (scheduledDate: string, status: string) => {
      try {
        return status === "scheduled" && new Date(scheduledDate) < new Date()
      } catch {
        return false
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manutenções Agendadas</CardTitle>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por veículo, categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="1">Baixa</SelectItem>
                <SelectItem value="2">Média</SelectItem>
                <SelectItem value="3">Alta</SelectItem>
                <SelectItem value="4">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={overdueFilter} onValueChange={setOverdueFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="overdue">Atrasadas</SelectItem>
                <SelectItem value="not_overdue">No prazo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredSchedules.length} de {schedules.length} manutenções
        </div>
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
              {filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {schedules.length === 0 ? (
                      <>
                        Nenhuma manutenção agendada.{" "}
                        <Link href="/maintenance/schedule" className="text-primary hover:underline">
                          Agendar a primeira manutenção
                        </Link>
                      </>
                    ) : (
                      "Nenhuma manutenção corresponde aos filtros aplicados."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((schedule) => (
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
