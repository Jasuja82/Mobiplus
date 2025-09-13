"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from "recharts"

interface PerformanceMetricsProps {
  filters: any
}

const departmentPerformanceData = [
  {
    department: "Minibus Angra",
    efficiency: 85,
    utilization: 92,
    maintenance: 78,
    cost: 88,
    safety: 95,
    punctuality: 89,
  },
  {
    department: "Transporte Urbano",
    efficiency: 78,
    utilization: 88,
    maintenance: 85,
    cost: 82,
    safety: 92,
    punctuality: 94,
  },
  {
    department: "Manutenção",
    efficiency: 90,
    utilization: 75,
    maintenance: 95,
    cost: 85,
    safety: 98,
    punctuality: 87,
  },
]

const kpiComparisonData = [
  { metric: "Fuel Efficiency", current: 8.2, target: 8.0, industry: 8.5 },
  { metric: "Vehicle Utilization", current: 87, target: 85, industry: 82 },
  { metric: "Maintenance Cost", current: 0.15, target: 0.18, industry: 0.2 },
  { metric: "Downtime", current: 3.2, target: 5.0, industry: 4.5 },
  { metric: "Safety Score", current: 94, target: 90, industry: 88 },
]

const driverPerformanceData = [
  { driver: "João Silva", efficiency: 7.8, safety: 95, punctuality: 92, distance: 1200 },
  { driver: "Maria Santos", efficiency: 8.1, safety: 98, punctuality: 89, distance: 1350 },
  { driver: "Carlos Pereira", efficiency: 8.4, safety: 91, punctuality: 94, distance: 980 },
  { driver: "Ana Costa", efficiency: 7.9, safety: 96, punctuality: 91, distance: 1100 },
  { driver: "Pedro Sousa", efficiency: 8.2, safety: 93, punctuality: 88, distance: 1250 },
]

export function PerformanceMetrics({ filters }: PerformanceMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Department Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Overview</CardTitle>
          <CardDescription>Multi-dimensional performance comparison across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              "Minibus Angra": { label: "Minibus Angra", color: "hsl(var(--chart-1))" },
              "Transporte Urbano": { label: "Transporte Urbano", color: "hsl(var(--chart-2))" },
              Manutenção: { label: "Manutenção", color: "hsl(var(--chart-3))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={[
                  { metric: "Efficiency", "Minibus Angra": 85, "Transporte Urbano": 78, Manutenção: 90 },
                  { metric: "Utilization", "Minibus Angra": 92, "Transporte Urbano": 88, Manutenção: 75 },
                  { metric: "Maintenance", "Minibus Angra": 78, "Transporte Urbano": 85, Manutenção: 95 },
                  { metric: "Cost", "Minibus Angra": 88, "Transporte Urbano": 82, Manutenção: 85 },
                  { metric: "Safety", "Minibus Angra": 95, "Transporte Urbano": 92, Manutenção: 98 },
                  { metric: "Punctuality", "Minibus Angra": 89, "Transporte Urbano": 94, Manutenção: 87 },
                ]}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Minibus Angra"
                  dataKey="Minibus Angra"
                  stroke="var(--color-minibus-angra)"
                  fill="var(--color-minibus-angra)"
                  fillOpacity={0.1}
                />
                <Radar
                  name="Transporte Urbano"
                  dataKey="Transporte Urbano"
                  stroke="var(--color-transporte-urbano)"
                  fill="var(--color-transporte-urbano)"
                  fillOpacity={0.1}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* KPI vs Target Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Performance vs Targets</CardTitle>
          <CardDescription>Current performance against targets and industry benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kpiComparisonData.map((kpi, index) => {
              const performance = (kpi.current / kpi.target) * 100
              const isGood = performance >= 100

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{kpi.metric}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={isGood ? "default" : "secondary"}>{performance.toFixed(0)}%</Badge>
                    </div>
                  </div>
                  <Progress value={Math.min(performance, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {kpi.current}</span>
                    <span>Target: {kpi.target}</span>
                    <span>Industry: {kpi.industry}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Driver Performance Scatter */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Driver Performance Analysis</CardTitle>
          <CardDescription>Fuel efficiency vs safety score by driver</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              efficiency: { label: "Fuel Efficiency (L/100km)", color: "hsl(var(--chart-1))" },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={driverPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="safety" name="Safety Score" unit="%" domain={[85, 100]} />
                <YAxis dataKey="efficiency" name="Fuel Efficiency" unit="L/100km" domain={[7.5, 8.5]} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name, props) => [
                    `${value}${name === "safety" ? "%" : "L/100km"}`,
                    name === "safety" ? "Safety Score" : "Fuel Efficiency",
                  ]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.driver || ""}
                />
                <Scatter dataKey="efficiency" fill="var(--color-efficiency)" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
