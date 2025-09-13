"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsFilters, type AnalyticsFilters as FiltersType } from "@/components/analytics/AnalyticsFilters"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Gauge, Route, Calendar, BarChart3, Activity } from "lucide-react"

export function MileageMetricsDashboard() {
  const [filters, setFilters] = useState<FiltersType>({
    dateRange: undefined,
    timePeriod: "month",
    assignment: "all",
    location: "all",
    department: "all",
    vehicle: "all",
  })

  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMileageData()
  }, [filters])

  const fetchMileageData = async () => {
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

      const response = await fetch(`/api/metrics/mileage?${queryParams}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching mileage metrics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!data) return <div>Carregando métricas de quilometragem...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Métricas de Quilometragem</h1>
        <p className="text-muted-foreground">Análise detalhada da utilização e percursos dos veículos</p>
      </div>

      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        locations={data.locations || []}
        departments={data.departments || []}
        vehicles={data.vehicles || []}
        assignments={data.assignments || []}
        isLoading={isLoading}
      />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Km Totais</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalKilometers?.toLocaleString("pt-PT") || "0"}</div>
            <p className="text-xs text-muted-foreground">
              {data.kilometersChange > 0 ? "+" : ""}
              {data.kilometersChange}% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Km Médios/Dia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageDaily?.toFixed(0) || "0"}</div>
            <p className="text-xs text-muted-foreground">Por veículo ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilização</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.utilizationRate?.toFixed(1) || "0"}%</div>
            <p className="text-xs text-muted-foreground">Taxa de utilização da frota</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.efficiency?.toFixed(1) || "0"}</div>
            <p className="text-xs text-muted-foreground">Km por litro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viagens</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTrips || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.tripsChange > 0 ? "+" : ""}
              {data.tripsChange}% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="utilization">Utilização</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
          <TabsTrigger value="vehicles">Por Veículo</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quilometragem Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} km`, "Quilómetros"]} />
                    <Legend />
                    <Area type="monotone" dataKey="kilometers" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Viagens por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="trips" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Utilização por Veículo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.vehicleUtilization || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vehicle" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Utilização"]} />
                    <Bar dataKey="utilization" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Utilização</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.utilizationDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="vehicles" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Eficiência Energética</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.efficiencyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} km/L`, "Eficiência"]} />
                    <Line type="monotone" dataKey="efficiency" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparação de Eficiência</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.vehicleEfficiency || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vehicle" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} km/L`, "Eficiência"]} />
                    <Bar dataKey="efficiency" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Veículos por Quilometragem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.vehicleRanking || []} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="vehicle" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} km`, "Quilómetros"]} />
                  <Bar dataKey="kilometers" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
