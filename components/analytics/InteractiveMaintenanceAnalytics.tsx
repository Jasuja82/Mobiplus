"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Wrench, TrendingUp, TrendingDown, Calendar, Loader2 } from "lucide-react"

interface InteractiveMaintenanceAnalyticsProps {
  data?: Array<{
    intervention_date: string
    total_cost: number | null
    vehicle_id: string
    intervention_type: string
    vehicle?: {
      license_plate: string
      make: string
      model: string
    }
  }>
  isLoading?: boolean
}

export function InteractiveMaintenanceAnalytics({
  data = [],
  isLoading = false,
}: InteractiveMaintenanceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedVehicle, setSelectedVehicle] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Nenhum dado de manutenção disponível para o período selecionado.
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get unique vehicles and types for filters
  const vehicles = Array.from(new Set(data.map((record) => record.vehicle_id))).map((vehicleId) => {
    const record = data.find((r) => r.vehicle_id === vehicleId)
    return {
      id: vehicleId,
      label: record?.vehicle
        ? `${record.vehicle.license_plate} - ${record.vehicle.make} ${record.vehicle.model}`
        : vehicleId,
    }
  })

  const interventionTypes = Array.from(new Set(data.map((record) => record.intervention_type))).filter(Boolean)

  // Filter data based on selections
  const filteredData = data.filter((record) => {
    const recordDate = new Date(record.intervention_date)
    const now = new Date()
    const monthsBack = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)

    const dateFilter = recordDate >= cutoffDate
    const vehicleFilter = selectedVehicle === "all" || record.vehicle_id === selectedVehicle
    const typeFilter = selectedType === "all" || record.intervention_type === selectedType

    return dateFilter && vehicleFilter && typeFilter
  })

  // Process data for charts
  const monthlyData = filteredData.reduce(
    (acc, record) => {
      const date = new Date(record.intervention_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          cost: 0,
          interventions: 0,
          avgCostPerIntervention: 0,
        }
      }

      acc[monthKey].cost += record.total_cost || 0
      acc[monthKey].interventions += 1

      return acc
    },
    {} as Record<string, any>,
  )

  const chartData = Object.values(monthlyData)
    .map((data: any) => ({
      ...data,
      avgCostPerIntervention: data.interventions > 0 ? data.cost / data.interventions : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Calculate summary metrics
  const totalCost = filteredData.reduce((sum, record) => sum + (record.total_cost || 0), 0)
  const totalInterventions = filteredData.length
  const avgCostPerIntervention = totalInterventions > 0 ? totalCost / totalInterventions : 0
  const uniqueVehicles = new Set(filteredData.map((r) => r.vehicle_id)).size

  // Calculate trend
  const firstMonth = chartData[0]
  const lastMonth = chartData[chartData.length - 1]
  const costTrend =
    firstMonth && lastMonth && firstMonth.avgCostPerIntervention > 0
      ? ((lastMonth.avgCostPerIntervention - firstMonth.avgCostPerIntervention) / firstMonth.avgCostPerIntervention) *
        100
      : 0

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

        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Veículo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os veículos</SelectItem>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {interventionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-orange-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">€{totalCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Intervenções</p>
                <p className="text-2xl font-bold">{totalInterventions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-purple-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Custo Médio</p>
                <p className="text-2xl font-bold">€{avgCostPerIntervention.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              {costTrend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tendência</p>
                <p className={`text-2xl font-bold ${costTrend >= 0 ? "text-red-600" : "text-green-600"}`}>
                  {costTrend >= 0 ? "+" : ""}
                  {costTrend.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, "Custo"]} />
                <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intervenções Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [value, "Intervenções"]} />
                <Bar dataKey="interventions" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custo Médio por Intervenção</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`€${value.toFixed(0)}`, "Custo Médio"]} />
              <Line type="monotone" dataKey="avgCostPerIntervention" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
