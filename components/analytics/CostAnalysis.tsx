"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface CostAnalysisProps {
  fuelCost: number
  maintenanceCost: number
}

export function CostAnalysis({ fuelCost, maintenanceCost }: CostAnalysisProps) {
  const totalCost = fuelCost + maintenanceCost

  const costData = [
    {
      name: "Combustível",
      value: fuelCost,
      percentage: totalCost > 0 ? (fuelCost / totalCost) * 100 : 0,
      color: "#3b82f6",
    },
    {
      name: "Manutenção",
      value: maintenanceCost,
      percentage: totalCost > 0 ? (maintenanceCost / totalCost) * 100 : 0,
      color: "#f59e0b",
    },
  ]

  // Estimated additional costs (insurance, depreciation, etc.)
  const estimatedInsurance = totalCost * 0.15 // 15% of operational costs
  const estimatedDepreciation = totalCost * 0.25 // 25% of operational costs

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Custos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Cost Breakdown Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={costData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, "Custo"]} />
            </PieChart>
          </ResponsiveContainer>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Custos Operacionais (Mês Atual)</h4>
            {costData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">€{item.value.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Cost Summary */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Custos Operacionais</span>
              <span className="text-sm font-medium">€{totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Seguros (estimado)</span>
              <span className="text-sm font-medium">€{estimatedInsurance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Depreciação (estimada)</span>
              <span className="text-sm font-medium">€{estimatedDepreciation.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-medium">
              <span className="text-sm">Custo Total Estimado</span>
              <span className="text-sm">€{(totalCost + estimatedInsurance + estimatedDepreciation).toFixed(2)}</span>
            </div>
          </div>

          {/* Cost per Vehicle */}
          <div className="pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Custo por Veículo/Mês</span>
              <span className="text-sm font-medium">€{(totalCost / Math.max(1, 10)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
