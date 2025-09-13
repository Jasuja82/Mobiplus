"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"

interface FleetOverviewChartsProps {
  filters: any
}

const vehicleStatusData = [
  { name: "Active", value: 42, color: "#22c55e" },
  { name: "Maintenance", value: 3, color: "#f59e0b" },
  { name: "Inactive", value: 2, color: "#ef4444" },
]

const departmentData = [
  { department: "Minibus Angra", vehicles: 18, utilization: 85, cost: 12500 },
  { department: "Transporte Urbano", vehicles: 22, utilization: 92, cost: 15200 },
  { department: "Manutenção", vehicles: 5, utilization: 78, cost: 3800 },
]

const monthlyTrendsData = [
  { month: "Jan", distance: 45000, fuel: 3200, maintenance: 1200 },
  { month: "Feb", distance: 48000, fuel: 3400, maintenance: 800 },
  { month: "Mar", distance: 52000, fuel: 3600, maintenance: 1500 },
  { month: "Apr", distance: 49000, fuel: 3300, maintenance: 900 },
  { month: "May", distance: 51000, fuel: 3500, maintenance: 1100 },
  { month: "Jun", distance: 53000, fuel: 3700, maintenance: 1300 },
]

export function FleetOverviewCharts({ filters }: FleetOverviewChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Vehicle Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Status Distribution</CardTitle>
          <CardDescription>Current status of all fleet vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              active: { label: "Active", color: "#22c55e" },
              maintenance: { label: "Maintenance", color: "#f59e0b" },
              inactive: { label: "Inactive", color: "#ef4444" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Vehicle count and utilization by department</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              vehicles: { label: "Vehicles", color: "hsl(var(--chart-1))" },
              utilization: { label: "Utilization %", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="vehicles" fill="var(--color-vehicles)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Fleet Trends</CardTitle>
          <CardDescription>Distance, fuel consumption, and maintenance costs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              distance: { label: "Distance (km)", color: "hsl(var(--chart-1))" },
              fuel: { label: "Fuel (L)", color: "hsl(var(--chart-2))" },
              maintenance: { label: "Maintenance (€)", color: "hsl(var(--chart-3))" },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="distance"
                  stackId="1"
                  stroke="var(--color-distance)"
                  fill="var(--color-distance)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="fuel"
                  stackId="2"
                  stroke="var(--color-fuel)"
                  fill="var(--color-fuel)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="maintenance"
                  stackId="3"
                  stroke="var(--color-maintenance)"
                  fill="var(--color-maintenance)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
