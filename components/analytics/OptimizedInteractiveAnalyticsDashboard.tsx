"use client"

import { useState, useCallback, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsFilters, type AnalyticsFilters as FiltersType } from "./AnalyticsFilters"
import { InteractiveFuelAnalytics } from "./InteractiveFuelAnalytics"
import { InteractiveMaintenanceAnalytics } from "./InteractiveMaintenanceAnalytics"
import { InteractiveFleetMetrics } from "./InteractiveFleetMetrics"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor"
import { Loader2 } from "lucide-react"

export const OptimizedInteractiveAnalyticsDashboard = memo(function OptimizedInteractiveAnalyticsDashboard() {
  const { logPerformance } = usePerformanceMonitor("InteractiveAnalyticsDashboard")

  const [filters, setFilters] = useState<FiltersType>({
    dateRange: undefined,
    timePeriod: "month",
    assignment: "all",
    location: "all",
    department: "all",
    vehicle: "all",
  })

  const { data, isLoading, error, refresh } = useDashboardData({
    timePeriod: filters.timePeriod,
    assignment: filters.assignment,
    location: filters.location,
    department: filters.department,
    vehicle: filters.vehicle,
    ...(filters.dateRange?.from && { startDate: filters.dateRange.from.toISOString() }),
    ...(filters.dateRange?.to && { endDate: filters.dateRange.to.toISOString() }),
  })

  const handleFiltersChange = useCallback((newFilters: FiltersType) => {
    setFilters(newFilters)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando dados analíticos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.error("[v0] Analytics Dashboard Error:", error)
    return (
      <div className="text-center p-6">
        <div className="text-red-500 mb-4">Erro ao carregar dados analíticos</div>
        <button onClick={refresh} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center p-6 text-muted-foreground">Nenhum dado disponível</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise Interativa da Frota</h1>
        <p className="text-muted-foreground">Dashboard dinâmico com filtros e métricas em tempo real</p>
      </div>

      <AnalyticsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        locations={data.locations}
        departments={data.departments}
        vehicles={data.vehicles}
        assignments={data.assignments}
        isLoading={isLoading}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="fuel">Combustível</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="fleet">Frota</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{data.analytics?.totalCost?.toLocaleString("pt-PT") || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  {data.analytics?.costChange > 0 ? "+" : ""}
                  {data.analytics?.costChange}% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Combustível</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.analytics?.totalFuel?.toLocaleString("pt-PT") || "0"}L</div>
                <p className="text-xs text-muted-foreground">
                  {data.analytics?.fuelChange > 0 ? "+" : ""}
                  {data.analytics?.fuelChange}% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.analytics?.totalMaintenance || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  {data.analytics?.maintenanceChange > 0 ? "+" : ""}
                  {data.analytics?.maintenanceChange}% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quilometragem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.analytics?.totalKilometers?.toLocaleString("pt-PT") || "0"} km
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.analytics?.kilometersChange > 0 ? "+" : ""}
                  {data.analytics?.kilometersChange}% vs período anterior
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <InteractiveFuelAnalytics data={data.analytics?.fuel} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <InteractiveMaintenanceAnalytics data={data.analytics?.maintenance} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <InteractiveFleetMetrics data={data.analytics?.fleet} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
})
