"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

export interface AnalyticsFilters {
  dateRange: DateRange | undefined
  timePeriod: "month" | "quarter" | "semester" | "year"
  assignment: string
  location: string
  department: string
  vehicle: string
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters
  onFiltersChange: (filters: AnalyticsFilters) => void
  locations: Array<{ id: string; name: string }>
  departments: Array<{ id: string; name: string }>
  vehicles: Array<{ id: string; license_plate: string }>
  assignments: Array<{ id: string; name: string }>
  isLoading?: boolean
}

export function AnalyticsFilters({
  filters,
  onFiltersChange,
  locations,
  departments,
  vehicles,
  assignments,
  isLoading = false,
}: AnalyticsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof AnalyticsFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      dateRange: undefined,
      timePeriod: "month",
      assignment: "all",
      location: "all",
      department: "all",
      vehicle: "all",
    })
  }

  const getQuickDateRange = (period: string): DateRange => {
    const now = new Date()
    const start = new Date()

    switch (period) {
      case "month":
        start.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        start.setMonth(now.getMonth() - 3)
        break
      case "semester":
        start.setMonth(now.getMonth() - 6)
        break
      case "year":
        start.setFullYear(now.getFullYear() - 1)
        break
    }

    return { from: start, to: now }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros de Análise
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Time Period Quick Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select
              value={filters.timePeriod}
              onValueChange={(value: any) => {
                handleFilterChange("timePeriod", value)
                handleFilterChange("dateRange", getQuickDateRange(value))
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="semester">Último Semestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período Personalizado</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "dd/MM/yy")} - {format(filters.dateRange.to, "dd/MM/yy")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    "Selecionar período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => handleFilterChange("dateRange", range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Localização</label>
            <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Localizações</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Departamento</label>
            <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Atribuição</label>
            <Select value={filters.assignment} onValueChange={(value) => handleFilterChange("assignment", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Atribuições</SelectItem>
                {assignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Veículo</label>
            <Select value={filters.vehicle} onValueChange={(value) => handleFilterChange("vehicle", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Veículos</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
