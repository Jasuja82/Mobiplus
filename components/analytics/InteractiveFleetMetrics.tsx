"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { Car, Fuel, Wrench, TrendingUp, MapPin, Loader2 } from "lucide-react"

interface InteractiveFleetMetricsProps {
  data?: {
    vehicles: Array<{
      id: string
      license_plate: string
      make: string
      model: string
      year: number
      status: string
      department_id?: string
      department?: {
        name: string
      }
    }>
    assignments: Array<{
      vehicle_id: string
      assignment_date: string
      return_date?: string
      mileage_start: number
      mileage_end?: number
    }>
    refuelRecords: Array<{
      vehicle_id: string
      refuel_date: string
      total_cost: number
      liters: number
    }>
    maintenanceRecords: Array<{
      vehicle_id: string
      intervention_date: string
      total_cost: number | null
    }>
  }
  isLoading?: boolean
}

export function InteractiveFleetMetrics({ data, isLoading = false }: InteractiveFleetMetricsProps) {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data || !data.vehicles || data.vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Nenhum dado da frota disponível para o período selecionado.
          </div>
        </CardContent>
      </Card>
    )
  }

  const { vehicles, assignments = [], refuelRecords = [], maintenanceRecords = [] } = data

  // Get unique departments for filter
  const departments = Array.from(new Set(vehicles.map((v) => v.department?.name).filter(Boolean))).map((name) => ({
    id: name,
    name,
  }))

  // Filter data based on selections
  const now = new Date()
  const monthsBack = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)

  const filteredVehicles = vehicles.filter(
    (vehicle) => selectedDepartment === "all" || vehicle.department?.name === selectedDepartment,
  )

  const filteredRefuelRecords = refuelRecords.filter((record) => {
    const recordDate = new Date(record.refuel_date)
    const vehicleMatch = filteredVehicles.some((v) => v.id === record.vehicle_id)
    return recordDate >= cutoffDate && vehicleMatch
  })

  const filteredMaintenanceRecords = maintenanceRecords.filter((record) => {
    const recordDate = new Date(record.intervention_date)
    const vehicleMatch = filteredVehicles.some((v) => v.id === record.vehicle_id)
    return recordDate >= cutoffDate && vehicleMatch
  })

  const filteredAssignments = assignments.filter((assignment) => {
    const assignmentDate = new Date(assignment.assignment_date)
    const vehicleMatch = filteredVehicles.some((v) => v.id === assignment.vehicle_id)
    return assignmentDate >= cutoffDate && vehicleMatch
  })

  // Calculate metrics
  const totalVehicles = filteredVehicles.length
  const activeVehicles = filteredVehicles.filter((v) => v.status === "active").length
  const totalFuelCost = filteredRefuelRecords.reduce((sum, record) => sum + record.total_cost, 0)
  const totalMaintenanceCost = filteredMaintenanceRecords.reduce((sum, record) => sum + (record.total_cost || 0), 0)
  const totalMileage = filteredAssignments.reduce((sum, assignment) => {
    return sum + ((assignment.mileage_end || 0) - assignment.mileage_start)
  }, 0)

  // Vehicle status distribution
  const statusData = [
    { name: "Ativo", value: filteredVehicles.filter((v) => v.status === "active").length, color: "#10b981" },
    { name: "Manutenção", value: filteredVehicles.filter((v) => v.status === "maintenance").length, color: "#f59e0b" },
    { name: "Inativo", value: filteredVehicles.filter((v) => v.status === "inactive").length, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  // Monthly cost trends
  const monthlyData = Array.from({ length: monthsBack }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    const monthFuelCost = filteredRefuelRecords
      .filter((record) => record.refuel_date.startsWith(monthKey))
      .reduce((sum, record) => sum + record.total_cost, 0)

    const monthMaintenanceCost = filteredMaintenanceRecords
      .filter((record) => record.intervention_date.startsWith(monthKey))
      .reduce((sum, record) => sum + (record.total_cost || 0), 0)

    return {
      month: monthKey,
      fuelCost: monthFuelCost,
      maintenanceCost: monthMaintenanceCost,
      totalCost: monthFuelCost + monthMaintenanceCost,
    }
  }).reverse()

  // Department distribution
  const departmentData = departments.map((dept) => {
    const deptVehicles = vehicles.filter((v) => v.department?.name === dept.name)
    return {
      name: dept.name,
      vehicles: deptVehicles.length,
      fuelCost: filteredRefuelRecords
        .filter((record) => deptVehicles.some((v) => v.id === record.vehicle_id))
        .reduce((sum, record) => sum + record.total_cost, 0),
    }
  })

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Últimos 3 meses</SelectItem>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
            <SelectItem value="12months">Último ano</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Veículos</p>
                <p className="text-2xl font-bold">{totalVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{activeVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Fuel className="h-4 w-4 text-orange-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Combustível</p>
                <p className="text-2xl font-bold">€{totalFuelCost.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-purple-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Manutenção</p>
                <p className="text-2xl font-bold">€{totalMaintenanceCost.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Quilometragem</p>
                <p className="text-2xl font-bold">{totalMileage.toLocaleString()}km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custos Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `€${value.toFixed(2)}`,
                    name === "fuelCost" ? "Combustível" : name === "maintenanceCost" ? "Manutenção" : "Total",
                  ]}
                />
                <Bar dataKey="fuelCost" stackId="a" fill="#f59e0b" />
                <Bar dataKey="maintenanceCost" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "vehicles" ? value : `€${value.toFixed(2)}`,
                  name === "vehicles" ? "Veículos" : "Custo Combustível",
                ]}
              />
              <Bar dataKey="vehicles" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
