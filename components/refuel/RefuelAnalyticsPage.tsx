"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, TrendingUp, Fuel, Route, Filter, Download, RefreshCw } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { createBrowserClient } from "@/lib/supabase/client"
import type { RefuelAnalytics } from "@/lib/types/database"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function RefuelAnalyticsPage() {
  const [data, setData] = useState<RefuelAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    vehicle_id: "all",
    start_date: "",
    end_date: "",
    flagged_only: false,
  })
  const [summary, setSummary] = useState({
    totalRecords: 0,
    flaggedRecords: 0,
    flaggedPercentage: 0,
    averageFuelEfficiency: 0,
    averageKmPerLiter: 0,
  })
  const [vehicles, setVehicles] = useState<any[]>([])

  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
    loadVehicles()
  }, [])

  useEffect(() => {
    loadData()
  }, [filters])

  const loadVehicles = async () => {
    try {
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("id, license_plate, internal_number")
        .eq("status", "active")
        .order("license_plate")

      if (vehiclesData) {
        setVehicles(vehiclesData)
      }
    } catch (error) {
      console.error("Error loading vehicles:", error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (filters.vehicle_id !== "all") {
        params.append("vehicle_id", filters.vehicle_id)
      }
      if (filters.start_date) {
        params.append("start_date", filters.start_date)
      }
      if (filters.end_date) {
        params.append("end_date", filters.end_date)
      }
      if (filters.flagged_only) {
        params.append("flagged_only", "true")
      }

      const response = await fetch(`/api/refuel-analytics?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data || [])
        setSummary(result.summary || {})
      }
    } catch (error) {
      console.error("Error loading refuel analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const csvContent = [
      // CSV headers
      [
        "Data",
        "Veículo",
        "Condutor",
        "Posto",
        "Litros",
        "Preço/L",
        "Custo Total",
        "Quilometragem",
        "Diferença KM",
        "Eficiência L/100km",
        "KM/L",
        "Quilometragem Negativa",
        "Salto Alto KM",
        "Volume Alto",
        "Preço Incomum",
      ].join(","),
      // CSV data
      ...data.map((record) =>
        [
          new Date(record.data).toLocaleDateString("pt-PT"),
          record.license_plate || "",
          record.driver_name || "",
          record.fuel_station_name || "",
          record.liters,
          record.literCost,
          record.calculatedTotalLiterCost,
          record.odometer,
          record.calculatedOdometerDifference,
          record.fuel_efficiency_l_per_100km || "",
          record.km_per_liter || "",
          record.has_negative_mileage ? "Sim" : "Não",
          record.has_high_mileage_jump ? "Sim" : "Não",
          record.has_high_fuel_volume ? "Sim" : "Não",
          record.has_unusual_fuel_price ? "Sim" : "Não",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `refuel-analytics-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Process data for charts
  const monthlyTrends = data.reduce(
    (acc, record) => {
      const month = new Date(record.data).toLocaleDateString("pt-PT", { month: "short", year: "2-digit" })
      if (!acc[month]) {
        acc[month] = {
          month,
          totalCost: 0,
          totalLiters: 0,
          records: 0,
          avgEfficiency: 0,
          flaggedRecords: 0,
        }
      }
      acc[month].totalCost += record.calculatedTotalLiterCost
      acc[month].totalLiters += record.liters
      acc[month].records += 1
      if (record.fuel_efficiency_l_per_100km) {
        acc[month].avgEfficiency += record.fuel_efficiency_l_per_100km
      }
      if (
        record.has_negative_mileage ||
        record.has_high_mileage_jump ||
        record.has_high_fuel_volume ||
        record.has_unusual_fuel_price
      ) {
        acc[month].flaggedRecords += 1
      }
      return acc
    },
    {} as Record<string, any>,
  )

  const chartData = Object.values(monthlyTrends).map((item: any) => ({
    ...item,
    avgEfficiency: item.records > 0 ? item.avgEfficiency / item.records : 0,
    flaggedPercentage: item.records > 0 ? (item.flaggedRecords / item.records) * 100 : 0,
  }))

  // Vehicle efficiency data
  const vehicleEfficiency = data.reduce(
    (acc, record) => {
      if (!record.fuel_efficiency_l_per_100km) return acc

      const key = record.license_plate || record.vehicle_id
      if (!acc[key]) {
        acc[key] = {
          vehicle: key,
          totalEfficiency: 0,
          records: 0,
          totalCost: 0,
          totalLiters: 0,
        }
      }
      acc[key].totalEfficiency += record.fuel_efficiency_l_per_100km
      acc[key].records += 1
      acc[key].totalCost += record.calculatedTotalLiterCost
      acc[key].totalLiters += record.liters
      return acc
    },
    {} as Record<string, any>,
  )

  const vehicleChartData = Object.values(vehicleEfficiency).map((item: any) => ({
    vehicle: item.vehicle,
    avgEfficiency: item.records > 0 ? item.totalEfficiency / item.records : 0,
    totalCost: item.totalCost,
    totalLiters: item.totalLiters,
  }))

  // Data quality issues breakdown
  const qualityIssues = [
    { name: "Quilometragem Negativa", value: data.filter((r) => r.has_negative_mileage).length, color: "#FF6B6B" },
    { name: "Salto Alto KM", value: data.filter((r) => r.has_high_mileage_jump).length, color: "#4ECDC4" },
    { name: "Volume Alto", value: data.filter((r) => r.has_high_fuel_volume).length, color: "#45B7D1" },
    { name: "Preço Incomum", value: data.filter((r) => r.has_unusual_fuel_price).length, color: "#96CEB4" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise de Abastecimentos</h1>
          <p className="text-muted-foreground">Análise detalhada com monitorização da qualidade dos dados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Select
                value={filters.vehicle_id}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, vehicle_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os veículos</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Filtros</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="flagged_only"
                  checked={filters.flagged_only}
                  onChange={(e) => setFilters((prev) => ({ ...prev, flagged_only: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="flagged_only">Apenas com problemas</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registos</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRecords}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Problemas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.flaggedRecords}</div>
            <p className="text-xs text-muted-foreground">{summary.flaggedPercentage}% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageFuelEfficiency.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">L/100km</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KM por Litro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageKmPerLiter.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">km/L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualidade</CardTitle>
            {summary.flaggedPercentage < 5 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.flaggedPercentage < 5 ? "text-green-600" : "text-red-600"}`}>
              {summary.flaggedPercentage < 5 ? "Boa" : "Atenção"}
            </div>
            <p className="text-xs text-muted-foreground">{100 - summary.flaggedPercentage}% dados válidos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Custos</CardTitle>
                <CardDescription>Custo total por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, "Custo"]} />
                    <Line type="monotone" dataKey="totalCost" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consumo Mensal</CardTitle>
                <CardDescription>Litros consumidos por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}L`, "Litros"]} />
                    <Bar dataKey="totalLiters" fill="#10b981" />
                  </BarChart>
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
                <CardDescription>L/100km por veículo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleChartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="vehicle" type="category" width={80} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)} L/100km`, "Eficiência"]} />
                    <Bar dataKey="avgEfficiency" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custo vs Eficiência</CardTitle>
                <CardDescription>Relação entre custo total e eficiência</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={vehicleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="avgEfficiency" name="Eficiência" unit="L/100km" />
                    <YAxis dataKey="totalCost" name="Custo" unit="€" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter dataKey="totalCost" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Problemas de Qualidade</CardTitle>
                <CardDescription>Distribuição dos tipos de problemas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qualityIssues}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {qualityIssues.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualidade ao Longo do Tempo</CardTitle>
                <CardDescription>Percentagem de registos com problemas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Problemas"]} />
                    <Line type="monotone" dataKey="flaggedPercentage" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registos Detalhados</CardTitle>
              <CardDescription>
                {data.length} registos encontrados
                {filters.flagged_only && " (apenas com problemas)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Veículo</th>
                      <th className="text-left p-2">Condutor</th>
                      <th className="text-right p-2">Litros</th>
                      <th className="text-right p-2">€/L</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">KM</th>
                      <th className="text-right p-2">L/100km</th>
                      <th className="text-center p-2">Problemas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 50).map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(record.data).toLocaleDateString("pt-PT")}</td>
                        <td className="p-2">{record.license_plate}</td>
                        <td className="p-2">{record.driver_name}</td>
                        <td className="text-right p-2">{record.liters.toFixed(1)}</td>
                        <td className="text-right p-2">€{record.literCost.toFixed(3)}</td>
                        <td className="text-right p-2">€{record.calculatedTotalLiterCost.toFixed(2)}</td>
                        <td className="text-right p-2">{record.odometer.toLocaleString()}</td>
                        <td className="text-right p-2">{record.fuel_efficiency_l_per_100km?.toFixed(1) || "-"}</td>
                        <td className="text-center p-2">
                          <div className="flex gap-1 justify-center">
                            {record.has_negative_mileage && (
                              <Badge variant="destructive" className="text-xs">
                                KM-
                              </Badge>
                            )}
                            {record.has_high_mileage_jump && (
                              <Badge variant="secondary" className="text-xs">
                                KM+
                              </Badge>
                            )}
                            {record.has_high_fuel_volume && (
                              <Badge variant="outline" className="text-xs">
                                Vol
                              </Badge>
                            )}
                            {record.has_unusual_fuel_price && (
                              <Badge variant="outline" className="text-xs">
                                €
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 50 && (
                  <p className="text-center text-muted-foreground mt-4">
                    Mostrando primeiros 50 de {data.length} registos. Use os filtros para refinar.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
