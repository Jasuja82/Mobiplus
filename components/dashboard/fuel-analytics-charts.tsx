"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts"

interface FuelAnalyticsChartsProps {
  filters: any
}

const fuelEfficiencyData = [
  { vehicle: "Vehicle 01", efficiency: 7.8, target: 8.0, department: "Minibus Angra" },
  { vehicle: "Vehicle 28", efficiency: 8.2, target: 8.0, department: "Minibus Angra" },
  { vehicle: "Vehicle 70", efficiency: 8.5, target: 8.0, department: "Transporte Urbano" },
  { vehicle: "Vehicle 15", efficiency: 7.9, target: 8.0, department: "Transporte Urbano" },
  { vehicle: "Vehicle 42", efficiency: 9.1, target: 8.0, department: "Manutenção" },
]

const fuelCostTrendsData = [
  { month: "Jan", costPerKm: 0.12, pricePerLiter: 1.45, totalCost: 4200 },
  { month: "Feb", costPerKm: 0.13, pricePerLiter: 1.48, totalCost: 4500 },
  { month: "Mar", costPerKm: 0.14, pricePerLiter: 1.52, totalCost: 4800 },
  { month: "Apr", costPerKm: 0.13, pricePerLiter: 1.49, totalCost: 4300 },
  { month: "May", costPerKm: 0.14, pricePerLiter: 1.51, totalCost: 4600 },
  { month: "Jun", costPerKm: 0.15, pricePerLiter: 1.55, totalCost: 4900 },
]

const efficiencyVsDistanceData = [
  { distance: 1200, efficiency: 7.8, vehicle: "Vehicle 01" },
  { distance: 1500, efficiency: 8.2, vehicle: "Vehicle 28" },
  { distance: 980, efficiency: 8.5, vehicle: "Vehicle 70" },
  { distance: 1350, efficiency: 7.9, vehicle: "Vehicle 15" },
  { distance: 800, efficiency: 9.1, vehicle: "Vehicle 42" },
  { distance: 1100, efficiency: 8.0, vehicle: "Vehicle 33" },
  { distance: 1400, efficiency: 7.7, vehicle: "Vehicle 55" },
]

export function FuelAnalyticsCharts({ filters }: FuelAnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Fuel Efficiency by Vehicle */}
      <Card>
        <CardHeader>
          <CardTitle>Fuel Efficiency by Vehicle</CardTitle>
          <CardDescription>L/100km compared to target efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              efficiency: { label: "Actual", color: "hsl(var(--chart-1))" },
              target: { label: "Target", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelEfficiencyData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="vehicle" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="efficiency" fill="var(--color-efficiency)" />
                <Bar dataKey="target" fill="var(--color-target)" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Fuel Cost Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Fuel Cost Trends</CardTitle>
          <CardDescription>Monthly fuel costs and price per liter</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              totalCost: { label: "Total Cost (€)", color: "hsl(var(--chart-1))" },
              pricePerLiter: { label: "Price/L (€)", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelCostTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="totalCost" stroke="var(--color-totalCost)" strokeWidth={2} />
                <Line type="monotone" dataKey="pricePerLiter" stroke="var(--color-pricePerLiter)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Efficiency vs Distance Scatter */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Efficiency vs Distance Analysis</CardTitle>
          <CardDescription>Relationship between monthly distance and fuel efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              efficiency: { label: "Efficiency (L/100km)", color: "hsl(var(--chart-1))" },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={efficiencyVsDistanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="distance" name="Distance" unit="km" />
                <YAxis dataKey="efficiency" name="Efficiency" unit="L/100km" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Scatter dataKey="efficiency" fill="var(--color-efficiency)" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
