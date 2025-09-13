import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Fuel, Wrench, TrendingUp, TrendingDown } from "lucide-react"

interface FleetOverviewStatsProps {
  vehicleStats: {
    total: number
    active: number
    maintenance: number
    inactive: number
  }
  fuelStats: {
    currentMonth: {
      cost: number
      liters: number
      records: number
      vehicles: number
    }
    lastMonth: {
      cost: number
      liters: number
      records: number
    }
  }
  maintenanceStats: {
    currentMonth: {
      cost: number
      interventions: number
      vehicles: number
    }
    lastMonth: {
      cost: number
      interventions: number
    }
  }
}

export function FleetOverviewStats({ vehicleStats, fuelStats, maintenanceStats }: FleetOverviewStatsProps) {
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const fuelCostChange = calculatePercentageChange(fuelStats.currentMonth.cost, fuelStats.lastMonth.cost)
  const maintenanceCostChange = calculatePercentageChange(
    maintenanceStats.currentMonth.cost,
    maintenanceStats.lastMonth.cost,
  )

  const stats = [
    {
      title: "Frota Total",
      value: vehicleStats.total,
      description: `${vehicleStats.active} ativos, ${vehicleStats.maintenance} em manutenção`,
      icon: Car,
      color: "text-blue-600",
    },
    {
      title: "Custos Combustível",
      value: `€${fuelStats.currentMonth.cost.toFixed(0)}`,
      description: `${fuelStats.currentMonth.records} abastecimentos`,
      icon: Fuel,
      color: "text-green-600",
      change: fuelCostChange,
    },
    {
      title: "Custos Manutenção",
      value: `€${maintenanceStats.currentMonth.cost.toFixed(0)}`,
      description: `${maintenanceStats.currentMonth.interventions} intervenções`,
      icon: Wrench,
      color: "text-orange-600",
      change: maintenanceCostChange,
    },
    {
      title: "Custo Total Mensal",
      value: `€${(fuelStats.currentMonth.cost + maintenanceStats.currentMonth.cost).toFixed(0)}`,
      description: "Combustível + Manutenção",
      icon: TrendingUp,
      color: "text-purple-600",
      change: calculatePercentageChange(
        fuelStats.currentMonth.cost + maintenanceStats.currentMonth.cost,
        fuelStats.lastMonth.cost + maintenanceStats.lastMonth.cost,
      ),
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
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.change !== undefined && (
                <div className={`flex items-center text-xs ${stat.change >= 0 ? "text-red-600" : "text-green-600"}`}>
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stat.change).toFixed(1)}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
