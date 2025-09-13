"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface MaintenanceAnalyticsProps {
  currentMonth: {
    cost: number
    interventions: number
    vehicles: number
  }
  lastMonth: {
    cost: number
    interventions: number
  }
  trends: Array<{
    intervention_date: string
    total_cost: number | null
  }>
}

export function MaintenanceAnalytics({ currentMonth, lastMonth, trends }: MaintenanceAnalyticsProps) {
  // Process trends data for charts
  const monthlyData = trends.reduce(
    (acc, record) => {
      const date = new Date(record.intervention_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          cost: 0,
          interventions: 0,
        }
      }

      acc[monthKey].cost += record.total_cost || 0
      acc[monthKey].interventions += 1

      return acc
    },
    {} as Record<string, any>,
  )

  const chartData = Object.values(monthlyData).map((data: any) => ({
    ...data,
    avgCostPerIntervention: data.interventions > 0 ? data.cost / data.interventions : 0,
  }))

  const averageCostPerIntervention = currentMonth.interventions > 0 ? currentMonth.cost / currentMonth.interventions : 0
  const lastMonthAvgCost = lastMonth.interventions > 0 ? lastMonth.cost / lastMonth.interventions : 0
  const costChange =
    lastMonthAvgCost > 0 ? ((averageCostPerIntervention - lastMonthAvgCost) / lastMonthAvgCost) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Manutenção</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Custo Médio</p>
            <p className="text-2xl font-bold">€{averageCostPerIntervention.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">por intervenção</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Frequência</p>
            <p className="text-2xl font-bold">
              {(currentMonth.interventions / Math.max(currentMonth.vehicles, 1)).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">intervenções/veículo</p>
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
              <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, "Custo"]} />
              <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interventions Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Intervenções Mensais</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [value, "Intervenções"]} />
              <Bar dataKey="interventions" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
