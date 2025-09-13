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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Wrench, TrendingUp, Calendar, Euro, Clock } from "lucide-react"

export function MaintenanceMetricsDashboard() {
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
    fetchMaintenanceData()
  }, [filters])

  const fetchMaintenanceData = async () => {
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

      const response = await fetch(`/api/metrics/maintenance?${queryParams}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching maintenance metrics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!data) return <div>Carregando métricas de manutenção...</div>

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Métricas de Manutenção</h1>
        <p className="text-muted-foreground">Análise detalhada dos custos e frequência de manutenção</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Intervenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInterventions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.interventionsChange > 0 ? "+" : ""}
              {data.interventionsChange}% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.averageCost?.toFixed(2) || "0"}</div>
            <p className="text-xs text-muted-foreground">Por intervenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageDuration || 0}h</div>
            <p className="text-xs text-muted-foreground">Por intervenção</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="types">Tipos de Manutenção</TabsTrigger>
          <TabsTrigger value="vehicles">Por Veículo</TabsTrigger>
          <TabsTrigger value="schedule">Agendamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Custos Mensais</CardTitle>
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
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intervenções por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="interventions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.maintenanceTypes || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(data.maintenanceTypes || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.maintenanceTypes || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value}`, "Custo"]} />
                    <Bar dataKey="cost" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Veículos por Custo de Manutenção</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.vehicleRanking || []} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="vehicle" type="category" width={100} />
                  <Tooltip formatter={(value) => [`€${value}`, "Custo Total"]} />
                  <Bar dataKey="cost" fill="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manutenções Agendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.upcomingMaintenance || []).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                        <Calendar className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.vehicle}</p>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.date}</p>
                      <p className="text-sm text-muted-foreground">€{item.estimatedCost}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
