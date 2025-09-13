"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Fuel, DollarSign, Route, Gauge } from "lucide-react"
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
import { createBrowserClient } from "@/lib/supabase/client"

interface FuelAnalytics {
  month: string
  vehicle_id: string
  license_plate: string
  make: string
  model: string
  department_name: string
  location_name: string
  refuel_count: number
  total_liters: number
  total_cost: number
  avg_cost_per_liter: number
  total_distance: number
  avg_fuel_efficiency: number
  avg_cost_per_km: number
  avg_km_per_liter: number
}

interface FleetSummary {
  month: string
  active_vehicles: number
  active_drivers: number
  total_refuels: number
  total_liters: number
  total_cost: number
  avg_cost_per_liter: number
  total_distance: number
  fleet_avg_l_per_100km: number
  fleet_avg_cost_per_km: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function FuelAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<FuelAnalytics[]>([])
  const [fleetSummary, setFleetSummary] = useState<FleetSummary[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedVehicle, setSelectedVehicle] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

  const supabase = createBrowserClient()

  useEffect(() => {
    loadAnalytics()
    loadMasterData()
  }, [selectedPeriod, selectedVehicle, selectedDepartment])

  const loadMasterData = async () => {
    try {
      const [vehiclesRes, departmentsRes] = await Promise.all([
        supabase.from("vehicles").select("id, license_plate, make, model").eq("status", "active"),
        supabase.from("departments").select("id, name"),
      ])

      if (vehiclesRes.data) setVehicles(vehiclesRes.data)
      if (departmentsRes.data) setDepartments(departmentsRes.data)
    } catch (error) {
      console.error("[v0] Error loading master data:", error)
    }
  }

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Calculate date range based on selected period
      const monthsBack = selectedPeriod === "3months" ? 3 : selectedPeriod === "6months" ? 6 : 12
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - monthsBack)

      // Build query filters
      let analyticsQuery = supabase
        .from("monthly_fuel_analytics_by_vehicle")
        .select("*")
        .gte("month", startDate.toISOString())
        .order("month", { ascending: true })

      const fleetQuery = supabase
        .from("fleet_performance_summary")
        .select("*")
        .gte("month", startDate.toISOString())
        .order("month", { ascending: true })

      if (selectedVehicle !== "all") {
        analyticsQuery = analyticsQuery.eq("vehicle_id", selectedVehicle)
      }

      if (selectedDepartment !== "all") {
        analyticsQuery = analyticsQuery.eq("department_name", selectedDepartment)
      }

      const [analyticsRes, fleetRes] = await Promise.all([analyticsQuery, fleetQuery])

      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data)
      }

      if (fleetRes.data) {
        setFleetSummary(fleetRes.data)
      }
    } catch (error) {
      console.error("[v0] Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary metrics
  const totalCost = analytics.reduce((sum, item) => sum + (item.total_cost || 0), 0)
  const totalLiters = analytics.reduce((sum, item) => sum + (item.total_liters || 0), 0)
  const totalDistance = analytics.reduce((sum, item) => sum + (item.total_distance || 0), 0)
  const avgEfficiency =
    analytics.length > 0
      ? analytics.reduce((sum, item) => sum + (item.avg_fuel_efficiency || 0), 0) / analytics.length
      : 0

  // Prepare chart data
  const monthlyTrends = fleetSummary.map((item) => ({
    month: new Date(item.month).toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }),
    cost: item.total_cost,
    liters: item.total_liters,
    distance: item.total_distance,
    efficiency: item.fleet_avg_l_per_100km,
  }))

  const departmentData = analytics.reduce(
    (acc, item) => {
      const dept = item.department_name || "Unknown"
      if (!acc[dept]) {
        acc[dept] = { name: dept, cost: 0, liters: 0, distance: 0 }
      }
      acc[dept].cost += item.total_cost || 0
      acc[dept].liters += item.total_liters || 0
      acc[dept].distance += item.total_distance || 0
      return acc
    },
    {} as Record<string, any>,
  )

  const departmentChartData = Object.values(departmentData)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Fuel Analytics Dashboard
          </CardTitle>
          <CardDescription>Comprehensive fuel consumption and cost analysis for the MobiAzores fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={loadAnalytics} variant="outline">
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{selectedPeriod} period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liters</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLiters.toFixed(0)}L</div>
            <p className="text-xs text-muted-foreground">Fuel consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistance.toFixed(0)} km</div>
            <p className="text-xs text-muted-foreground">Distance traveled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency.toFixed(1)} L/100km</div>
            <p className="text-xs text-muted-foreground">Fleet average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fuel Trends</CardTitle>
            <CardDescription>Cost and consumption over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#8884d8" name="Cost (€)" />
                <Line yAxisId="right" type="monotone" dataKey="liters" stroke="#82ca9d" name="Liters" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Department Fuel Usage</CardTitle>
            <CardDescription>Consumption by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cost"
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`€${Number(value).toFixed(2)}`, "Cost"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Efficiency Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Fuel Efficiency Trends</CardTitle>
            <CardDescription>L/100km over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="efficiency" stroke="#ff7300" name="L/100km" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distance vs Cost */}
        <Card>
          <CardHeader>
            <CardTitle>Distance vs Cost Analysis</CardTitle>
            <CardDescription>Monthly distance and cost correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="distance" fill="#8884d8" name="Distance (km)" />
                <Bar yAxisId="right" dataKey="cost" fill="#82ca9d" name="Cost (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
