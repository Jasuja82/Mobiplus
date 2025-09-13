"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface FuelAnalyticsProps {
  currentMonth: {
    cost: number
    liters: number
    records: number
    vehicles: number
  }
  lastMonth: {
    cost: number
    liters: number
    records: number
  }
  trends: Array<{
    refuel_date: string
    total_cost: number
    liters: number
  }>
}

export function FuelAnalytics({ currentMonth, lastMonth, trends }: FuelAnalyticsProps) {
  // Process trends data for charts
  const monthlyData = trends.reduce(
    (acc, record) => {
      const date = new Date(record.refuel_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          cost: 0,
          liters: 0,
          records: 0,
        }
      }

      acc[monthKey].cost += record.total_cost
      acc[monthKey].liters += record.liters
      acc[monthKey].records += 1

      return acc
    },
    {} as Record<string, any>,
  )

  const chartData = Object.values(monthlyData).map((data: any) => ({
    ...data,
    avgCostPerLiter: data.liters > 0 ? data.cost / data.liters : 0,
  }))

  const averageCostPerLiter = currentMonth.liters > 0 ? currentMonth.cost / currentMonth.liters : 0
  const lastMonthAvgCost = lastMonth.liters > 0 ? lastMonth.cost / lastMonth.liters : 0
  const costPerLiterChange =
    lastMonthAvgCost > 0 ? ((averageCostPerLiter - lastMonthAvgCost) / lastMonthAvgCost) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Combustível</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Consumo Médio</p>
            <p className="text-2xl font-bold">
              {(currentMonth.liters / Math.max(currentMonth.vehicles, 1)).toFixed(1)}L
            </p>
            <p className="text-xs text-muted-foreground">por veículo/mês</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Preço Médio</p>
            <p className="text-2xl font-bold">€{averageCostPerLiter.toFixed(3)}</p>
            <p className={`text-xs ${costPerLiterChange >= 0 ? "text-red-600" : "text-green-600"}`}>
              {costPerLiterChange >= 0 ? "+" : ""}
              {costPerLiterChange.toFixed(1)}% vs mês anterior
            </p>
          </div>
        </div>

        {/* Cost Trend Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Evolução dos Custos (6 meses)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "cost" ? `€${value.toFixed(2)}` : `${value.toFixed(1)}L`,
                  name === "cost" ? "Custo" : "Litros",
                ]}
              />
              <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Consumption Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Consumo Mensal (Litros)</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}L`, "Litros"]} />
              <Bar dataKey="liters" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
