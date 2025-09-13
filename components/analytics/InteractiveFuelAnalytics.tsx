"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Calendar, TrendingUp, TrendingDown, Fuel, Loader2 } from "lucide-react"

interface InteractiveFuelAnalyticsProps {
  data?: Array<{
    refuel_date: string
    total_cost: number
    liters: number
    vehicle_id: string
    vehicle?: {
      license_plate: string
      make: string
      model: string
    }
  }>
  isLoading?: boolean
}

export function InteractiveFuelAnalytics({ data = [], isLoading = false }: InteractiveFuelAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedVehicle, setSelectedVehicle] = useState("all")

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
            Nenhum dado de combustível disponível para o período selecionado.
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get unique vehicles for filter
  const vehicles = Array.from(new Set(data.map((record) => record.vehicle_id))).map((vehicleId) => {
    const record = data.find((r) => r.vehicle_id === vehicleId)
    return {
      id: vehicleId,
      label: record?.vehicle
        ? `${record.vehicle.license_plate} - ${record.vehicle.make} ${record.vehicle.model}`
        : vehicleId,
    }
  })

  // Filter data based on selections
  const filteredData = data.filter((record) => {
    const recordDate = new Date(record.refuel_date)
    const now = new Date()
    const monthsBack = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)

    const dateFilter = recordDate >= cutoffDate
    const vehicleFilter = selectedVehicle === "all" || record.vehicle_id === selectedVehicle

    return dateFilter && vehicleFilter
  })

  // Process data for charts
  const monthlyData = filteredData.reduce(
    (acc, record) => {
      const date = new Date(record.refuel_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          cost: 0,
          liters: 0,
          records: 0,
          avgCostPerLiter: 0,
        }
      }

      acc[monthKey].cost += record.total_cost
      acc[monthKey].liters += record.liters
      acc[monthKey].records += 1

      return acc
    },
    {} as Record<string, any>,
  )

  const chartData = Object.values(monthlyData)
    .map((data: any) => ({
      ...data,
      avgCostPerLiter: data.liters > 0 ? data.cost / data.liters : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Calculate summary metrics
  const totalCost = filteredData.reduce((sum, record) => sum + record.total_cost, 0)
  const totalLiters = filteredData.reduce((sum, record) => sum + record.liters, 0)
  const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0
  const uniqueVehicles = new Set(filteredData.map((r) => r.vehicle_id)).size

  // Calculate trend (comparing first and last month)
  const firstMonth = chartData[0]
  const lastMonth = chartData[chartData.length - 1]
  const costTrend =
    firstMonth && lastMonth && firstMonth.avgCostPerLiter > 0
      ? ((lastMonth.avgCostPerLiter - firstMonth.avgCostPerLiter) / firstMonth.avgCostPerLiter) * 100
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Fuel className="h-4 w-4 text-blue-600" />
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
              <Fuel className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Litros</p>
                <p className="text-2xl font-bold">{totalLiters.toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Preço Médio</p>
                <p className="text-2xl font-bold">€{avgCostPerLiter.toFixed(3)}</p>
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
                <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consumo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}L`, "Litros"]} />
                <Bar dataKey="liters" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preço por Litro</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`€${value.toFixed(3)}`, "€/Litro"]} />
              <Line type="monotone" dataKey="avgCostPerLiter" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
