"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VehicleOilsFiltersProps {
  vehicle: any
}

export function VehicleOilsFilters({ vehicle }: VehicleOilsFiltersProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Óleos e filtros</CardTitle>
          <p className="text-sm text-muted-foreground">Informações sobre óleos e filtros do veículo</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Funcionalidade em desenvolvimento</div>
        </CardContent>
      </Card>
    </div>
  )
}
