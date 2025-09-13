"use client"

import { useState } from "react"
import type { MaintenanceSchedule } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type MaintenanceScheduleWithRelations = MaintenanceSchedule & {
  vehicle?: {
    license_plate: string
    make: string
    model: string
  } | null
  category?: {
    name: string
  } | null
}

interface MaintenanceCalendarProps {
  schedules: MaintenanceScheduleWithRelations[]
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const priorityColors = {
  1: "border-l-green-500",
  2: "border-l-yellow-500",
  3: "border-l-orange-500",
  4: "border-l-red-500",
}

export function MaintenanceCalendar({ schedules }: MaintenanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getSchedulesForDate = (date: Date | null) => {
    if (!date) return []

    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.scheduled_date)
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const daySchedules = getSchedulesForDate(day)
            const isToday =
              day &&
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`min-h-[100px] p-1 border rounded-lg ${
                  day ? "bg-white" : "bg-gray-50"
                } ${isToday ? "ring-2 ring-blue-500" : ""}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 3).map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`text-xs p-1 rounded border-l-2 ${
                            priorityColors[schedule.priority as keyof typeof priorityColors]
                          } bg-gray-50`}
                        >
                          <div className="font-medium truncate">{schedule.vehicle?.license_plate}</div>
                          <div className="text-gray-600 truncate">{schedule.category?.name || "Manutenção"}</div>
                        </div>
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">+{daySchedules.length - 3} mais</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-2 border-l-green-500 bg-gray-50"></div>
            <span>Baixa Prioridade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-2 border-l-yellow-500 bg-gray-50"></div>
            <span>Média Prioridade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-2 border-l-orange-500 bg-gray-50"></div>
            <span>Alta Prioridade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-2 border-l-red-500 bg-gray-50"></div>
            <span>Urgente</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
