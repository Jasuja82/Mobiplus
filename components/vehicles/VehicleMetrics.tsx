"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VehicleMetricsProps {
  vehicle: any
  metricsData: any[]
  refuelRecords: any[]
  maintenanceRecords: any[]
}

export function VehicleMetrics({ vehicle, metricsData, refuelRecords }: VehicleMetricsProps) {
  // Calculate metrics from refuel records
  const totalDistance = refuelRecords.reduce((sum, record) => sum + (record.distance_since_last_refuel || 0), 0)
  const totalFuel = refuelRecords.reduce((sum, record) => sum + (record.liters || 0), 0)
  const totalCost = refuelRecords.reduce((sum, record) => sum + (record.total_cost || 0), 0)
  const totalRefuels = refuelRecords.length

  const avgFuelEfficiency = totalDistance > 0 && totalFuel > 0 ? (totalFuel / totalDistance) * 100 : 0
  const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0
  const avgCostPerLiter = totalFuel > 0 ? totalCost / totalFuel : 0
  const kmPerRefuel = totalRefuels > 0 ? totalDistance / totalRefuels : 0
  const avgLiterPerRefuel = totalRefuels > 0 ? totalFuel / totalRefuels : 0

  return (
    <div className="space-y-6">
      {/* Vehicle Status Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">
          {vehicle.license_plate} - {vehicle.internal_number || vehicle.vehicle_number}
        </h2>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Ativo
        </Badge>
      </div>

      {/* Time Period Filters */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="month">Último mês</TabsTrigger>
          <TabsTrigger value="quarter">Último trimestre</TabsTrigger>
          <TabsTrigger value="year">Último ano</TabsTrigger>
          <TabsTrigger value="all">Todo o tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {/* Main Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600">{totalDistance.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Distância total</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600">{totalFuel.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground mt-1">Combustível total</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600">{totalCost.toFixed(2)} €</div>
                <div className="text-sm text-muted-foreground mt-1">Custo total</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600">{totalRefuels}</div>
                <div className="text-sm text-muted-foreground mt-1">Número de reabastecimentos</div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">{kmPerRefuel.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground mt-1">Kms por litro</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{avgFuelEfficiency.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">l/100km</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange-600">{avgCostPerKm.toFixed(2)} €</div>
                <div className="text-sm text-muted-foreground mt-1">Custo médio Custo/litro</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-red-600">{avgCostPerLiter.toFixed(2)} €</div>
                <div className="text-sm text-muted-foreground mt-1">Custo/km</div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">{kmPerRefuel.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground mt-1">Kms por reabastecimento</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{avgLiterPerRefuel.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground mt-1">Avg l / Reabastecimento</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other time period tabs would have similar content with filtered data */}
        <TabsContent value="month">
          <div className="text-center py-8 text-muted-foreground">Dados do último mês em desenvolvimento</div>
        </TabsContent>

        <TabsContent value="quarter">
          <div className="text-center py-8 text-muted-foreground">Dados do último trimestre em desenvolvimento</div>
        </TabsContent>

        <TabsContent value="year">
          <div className="text-center py-8 text-muted-foreground">Dados do último ano em desenvolvimento</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
