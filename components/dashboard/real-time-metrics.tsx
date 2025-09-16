"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Car, Fuel, Wrench, Euro, Activity } from "lucide-react"

interface MetricsState {
  totalVehicles: number
  activeVehicles: number
  maintenanceVehicles: number
  avgFuelEfficiency: number
  pendingMaintenance: number
  monthlyFuelCost: number
  monthlyMaintenanceCost: number
}

interface TrendsState {
  fuelEfficiencyTrend: number
  costTrend: number
  maintenanceTrend: number
}

export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState<MetricsState>({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    avgFuelEfficiency: 0,
    pendingMaintenance: 0,
    monthlyFuelCost: 0,
    monthlyMaintenanceCost: 0,
  })

  const [trends, setTrends] = useState<TrendsState>({
    fuelEfficiencyTrend: 0,
    costTrend: 0,
    maintenanceTrend: 0,
  })

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics/real-time")
      if (!response.ok) throw new Error("Failed to fetch metrics")

      const data = await response.json()
      setMetrics(data.metrics)
      setTrends(data.trends)
    } catch (error) {
      console.error("Error fetching real-time metrics:", error)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchMetrics()

    const interval = setInterval(fetchMetrics, 30000) // 30 seconds instead of 3

    return () => clearInterval(interval)
  }, [fetchMetrics])

  const vehicleUtilization = useMemo(
    () => (metrics.totalVehicles > 0 ? (metrics.activeVehicles / metrics.totalVehicles) * 100 : 0),
    [metrics.totalVehicles, metrics.activeVehicles],
  )

  const getTrendIcon = useCallback((trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }, [])

  const totalMonthlyCost = useMemo(
    () => metrics.monthlyFuelCost + metrics.monthlyMaintenanceCost,
    [metrics.monthlyFuelCost, metrics.monthlyMaintenanceCost],
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fleet Status</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.activeVehicles}/{metrics.totalVehicles}
          </div>
          <div className="space-y-2">
            <Progress value={vehicleUtilization} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Active</span>
              <span>{vehicleUtilization.toFixed(1)}%</span>
            </div>
          </div>
          {metrics.maintenanceVehicles > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">{metrics.maintenanceVehicles} in maintenance</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{metrics.avgFuelEfficiency.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">L/100km</div>
            {getTrendIcon(trends.fuelEfficiencyTrend)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Fleet average efficiency</p>
          {Math.abs(trends.fuelEfficiencyTrend) > 5 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {trends.fuelEfficiencyTrend > 0 ? "↑" : "↓"} {Math.abs(trends.fuelEfficiencyTrend).toFixed(1)}%
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Costs</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">€{totalMonthlyCost.toLocaleString()}</div>
              {getTrendIcon(trends.costTrend)}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Fuel:</span>
                <span>€{metrics.monthlyFuelCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance:</span>
                <span>€{metrics.monthlyMaintenanceCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{metrics.pendingMaintenance}</div>
            <div className="text-sm text-muted-foreground">pending</div>
            {getTrendIcon(trends.maintenanceTrend)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Vehicles due for service</p>
          {metrics.pendingMaintenance > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {metrics.pendingMaintenance > 5 ? "High priority" : "Normal priority"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
