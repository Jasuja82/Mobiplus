"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsFilters, type AnalyticsFilters as FiltersType } from "./AnalyticsFilters"
import { InteractiveFuelAnalytics } from "./InteractiveFuelAnalytics"
import { InteractiveMaintenanceAnalytics } from "./InteractiveMaintenanceAnalytics"
import { InteractiveFleetMetrics } from "./InteractiveFleetMetrics"
import { Loader2 } from "lucide-react"

interface DashboardData {
  locations: Array<{ id: string; name: string }>
  departments: Array<{ id: string; name: string }>
  vehicles: Array<{ id: string; license_plate: string }>
  assignments: Array<{ id: string; name: string }>
  analytics: any
}

export function InteractiveAnalyticsDashboard() {
  const [filters, setFilters] = useState<FiltersType>({
    dateRange: undefined,
    timePeriod: "month",
    assignment: "all",
    location: "all",
    department: "all",
    vehicle: "all",
  })

  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        timePeriod: filters.timePeriod,
        assignment: filters.assignment,
        location: filters.location,
        department: filters.department,
        vehicle: filters.vehicle,
        ...(filters.dateRange?.from && { startDate: filters.dateRange.from.toISOString() }),
        ...(filters.dateRange?.to && { endDate: filters.dateRange.to.toISOString() }),
      })

      const response = await fetch(`/api/analytics/dashboard?${queryParams}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise Interativa da Frota</h1>
        <p className="text-muted-foreground">Dashboard dinâmico com filtros e métricas em tempo real</p>
      </div>

      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
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
}
