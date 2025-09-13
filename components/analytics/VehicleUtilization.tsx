"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const utilizationData = [
  { name: "Ativos", value: 85, color: "#10b981" },
  { name: "Em Manutenção", value: 10, color: "#f59e0b" },
  { name: "Inativos", value: 5, color: "#ef4444" },
]

export function VehicleUtilization() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilização da Frota</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={utilizationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {utilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, "Percentagem"]} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="space-y-2">
            {utilizationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>

          {/* Efficiency Metrics */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Taxa de Disponibilidade</span>
              <span className="text-sm font-medium">90%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tempo Médio em Manutenção</span>
              <span className="text-sm font-medium">3.2 dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quilometragem Média/Mês</span>
              <span className="text-sm font-medium">2,450 km</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
