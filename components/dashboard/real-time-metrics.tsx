"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Car, Fuel, Wrench, Euro, Activity } from "lucide-react"
import { createFleetSignals } from "@/lib/signals"

export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    avgFuelEfficiency: 0,
    pendingMaintenance: 0,
    monthlyFuelCost: 0,
    monthlyMaintenanceCost: 0,
  })

  const [trends, setTrends] = useState({
    fuelEfficiencyTrend: 0,
    costTrend: 0,
    maintenanceTrend: 0,
  })

  useEffect(() => {
    const signals = createFleetSignals()

    // Subscribe to all signals
    const unsubscribers = [
      signals.totalVehicles.subscribe((value) => setMetrics((prev) => ({ ...prev, totalVehicles: value }))),
      signals.activeVehicles.subscribe((value) => setMetrics((prev) => ({ ...prev, activeVehicles: value }))),
      signals.maintenanceVehicles.subscribe((value) => setMetrics((prev) => ({ ...prev, maintenanceVehicles: value }))),
      signals.avgFuelEfficiency.subscribe((value) => setMetrics((prev) => ({ ...prev, avgFuelEfficiency: value }))),
      signals.pendingMaintenance.subscribe((value) => setMetrics((prev) => ({ ...prev, pendingMaintenance: value }))),
      signals.monthlyFuelCost.subscribe((value) => setMetrics((prev) => ({ ...prev, monthlyFuelCost: value }))),
      signals.monthlyMaintenanceCost.subscribe((value) =>
        setMetrics((prev) => ({ ...prev, monthlyMaintenanceCost: value })),
      ),
    ]

    // Simulate real-time updates
    const interval = setInterval(() => {
      signals.totalVehicles.set(25 + Math.floor(Math.random() * 5))
      signals.activeVehicles.set(20 + Math.floor(Math.random() * 5))
      signals.maintenanceVehicles.set(Math.floor(Math.random() * 3))
      signals.monthlyFuelCost.set(8500 + Math.floor(Math.random() * 1000))
      signals.monthlyMaintenanceCost.set(2300 + Math.floor(Math.random() * 500))

      // Update trends
      setTrends({
        fuelEfficiencyTrend: (Math.random() - 0.5) * 10,
        costTrend: (Math.random() - 0.5) * 15,
        maintenanceTrend: (Math.random() - 0.5) * 20,
      })
    }, 3000)

    return () => {
      unsubscribers.forEach((unsub) => unsub())
      clearInterval(interval)
    }
  }, [])

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const vehicleUtilization = metrics.totalVehicles > 0 ? (metrics.activeVehicles / metrics.totalVehicles) * 100 : 0

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
            <Badge variant="secondary" className="mt-2">
              {metrics.maintenanceVehicles} in maintenance
            </Badge>
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
            <Badge variant={trends.fuelEfficiencyTrend > 0 ? "destructive" : "default"} className="mt-2">
              {trends.fuelEfficiencyTrend > 0 ? "↑" : "↓"} {Math.abs(trends.fuelEfficiencyTrend).toFixed(1)}%
            </Badge>
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
              <div className="text-2xl font-bold">
                €{(metrics.monthlyFuelCost + metrics.monthlyMaintenanceCost).toLocaleString()}
              </div>
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
            <Badge variant={metrics.pendingMaintenance > 5 ? "destructive" : "secondary"} className="mt-2">
              {metrics.pendingMaintenance > 5 ? "High priority" : "Normal"}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
