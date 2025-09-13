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
  LineChart,
  Line,
} from "recharts"

interface MaintenanceAnalyticsProps {
  filters: any
}

const maintenanceTypeData = [
  { name: "Preventive", value: 45, color: "#22c55e" },
  { name: "Corrective", value: 28, color: "#f59e0b" },
  { name: "Inspection", value: 15, color: "#3b82f6" },
  { name: "Emergency", value: 12, color: "#ef4444" },
]

const maintenanceCostData = [
  { month: "Jan", preventive: 2500, corrective: 1800, inspection: 600 },
  { month: "Feb", preventive: 2200, corrective: 2100, inspection: 550 },
  { month: "Mar", preventive: 2800, corrective: 1600, inspection: 700 },
  { month: "Apr", preventive: 2400, corrective: 1900, inspection: 650 },
  { month: "May", preventive: 2600, corrective: 1700, inspection: 600 },
  { month: "Jun", preventive: 2900, corrective: 1500, inspection: 750 },
]

const vehicleMaintenanceData = [
  { vehicle: "Vehicle 01", scheduled: 8, completed: 7, overdue: 1, cost: 2400 },
  { vehicle: "Vehicle 28", scheduled: 6, completed: 6, overdue: 0, cost: 1800 },
  { vehicle: "Vehicle 70", scheduled: 9, completed: 8, overdue: 1, cost: 2800 },
  { vehicle: "Vehicle 15", scheduled: 7, completed: 6, overdue: 1, cost: 2100 },
  { vehicle: "Vehicle 42", scheduled: 5, completed: 5, overdue: 0, cost: 1500 },
]

export function MaintenanceAnalytics({ filters }: MaintenanceAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Maintenance Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Type Distribution</CardTitle>
          <CardDescription>Breakdown of maintenance activities by type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              preventive: { label: "Preventive", color: "#22c55e" },
              corrective: { label: "Corrective", color: "#f59e0b" },
              inspection: { label: "Inspection", color: "#3b82f6" },
              emergency: { label: "Emergency", color: "#ef4444" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={maintenanceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {maintenanceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Vehicle Maintenance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Maintenance Status</CardTitle>
          <CardDescription>Scheduled vs completed maintenance by vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              completed: { label: "Completed", color: "hsl(var(--chart-1))" },
              overdue: { label: "Overdue", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleMaintenanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="vehicle" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" />
                <Bar dataKey="overdue" fill="var(--color-overdue)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Maintenance Costs */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Maintenance Costs</CardTitle>
          <CardDescription>Maintenance expenses by type over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              preventive: { label: "Preventive", color: "hsl(var(--chart-1))" },
              corrective: { label: "Corrective", color: "hsl(var(--chart-2))" },
              inspection: { label: "Inspection", color: "hsl(var(--chart-3))" },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="preventive" stroke="var(--color-preventive)" strokeWidth={2} />
                <Line type="monotone" dataKey="corrective" stroke="var(--color-corrective)" strokeWidth={2} />
                <Line type="monotone" dataKey="inspection" stroke="var(--color-inspection)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
