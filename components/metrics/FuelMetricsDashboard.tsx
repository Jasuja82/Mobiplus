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
  ScatterChart,
  Scatter,
} from "recharts"
import { Fuel, TrendingUp, Gauge, Euro, BarChart3 } from "lucide-react"

export function FuelMetricsDashboard() {
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
    fetchFuelData()
  }, [filters])

  const fetchFuelData = async () => {
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

      const response = await fetch(`/api/metrics/fuel?${queryParams}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching fuel metrics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!data) return <div>Carregando métricas de combustível...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Métricas de Combustível</h1>
        <p className="text-muted-foreground">Análise detalhada do consumo e custos de combustível</p>
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
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.totalCost?.toLocaleString("pt-PT") || "0"}</div>
            <p className="text-xs text-muted-foreground">
              {data.costChange > 0 ? "+" : ""}
              {data.costChange}% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Litros Totais</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLiters?.toLocaleString("pt-PT") || "0"}L</div>
            <p className="text-xs text-muted-foreground">
              {data.litersChange > 0 ? "+" : ""}
              {data.litersChange}% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.averagePrice?.toFixed(3) || "0"}</div>
            <p className="text-xs text-muted-foreground">Por litro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Médio</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageConsumption?.toFixed(1) || "0"}</div>
            <p className="text-xs text-muted-foreground">L/100km</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abastecimentos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRefuels || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.refuelsChange > 0 ? "+" : ""}
              {data.refuelsChange}% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
          <TabsTrigger value="stations">Postos</TabsTrigger>
          <TabsTrigger value="vehicles">Por Veículo</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Custos Mensais de Combustível</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value}`, "Custo"]} />
                    <Legend />
                    <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="liters" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preço por Litro</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.priceHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value}`, "Preço/L"]} />
                    <Line type="monotone" dataKey="price" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Eficiência por Veículo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.vehicleEfficiency || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vehicle" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} L/100km`, "Consumo"]} />
                    <Bar dataKey="consumption" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlação Consumo vs Quilometragem</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={data.consumptionCorrelation || []}>
                    <CartesianGrid />
                    <XAxis dataKey="kilometers" name="Quilómetros" />
                    <YAxis dataKey="consumption" name="Consumo" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="Veículos" dataKey="consumption" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Custos por Posto</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.stationCosts || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="station" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value}`, "Custo Total"]} />
                    <Bar dataKey="cost" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preços Médios por Posto</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.stationPrices || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="station" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value}`, "Preço/L"]} />
                    <Bar dataKey="averagePrice" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Veículos por Custo de Combustível</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.vehicleRanking || []} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="vehicle" type="category" width={100} />
                  <Tooltip formatter={(value) => [`€${value}`, "Custo Total"]} />
                  <Bar dataKey="cost" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
