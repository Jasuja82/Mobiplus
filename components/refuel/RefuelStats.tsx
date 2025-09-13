import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, Fuel, TrendingUp, FileText } from "lucide-react"

interface RefuelStatsProps {
  totalCost: number
  totalLiters: number
  averageCostPerLiter: number
  recordCount: number
}

export function RefuelStats({ totalCost, totalLiters, averageCostPerLiter, recordCount }: RefuelStatsProps) {
  const stats = [
    {
      title: "Custo Total (Mês)",
      value: `€${totalCost.toFixed(2)}`,
      description: "Gasto em combustível",
      icon: Euro,
      color: "text-green-600",
    },
    {
      title: "Litros Consumidos",
      value: `${totalLiters.toFixed(1)}L`,
      description: "Volume total abastecido",
      icon: Fuel,
      color: "text-blue-600",
    },
    {
      title: "Preço Médio/Litro",
      value: `€${averageCostPerLiter.toFixed(3)}`,
      description: "Preço médio por litro",
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Abastecimentos",
      value: recordCount.toString(),
      description: "Registos este mês",
      icon: FileText,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
