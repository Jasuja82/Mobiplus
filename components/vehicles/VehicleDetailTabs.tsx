"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleBasicDetails } from "./VehicleBasicDetails"
import { VehicleEngineTransmission } from "./VehicleEngineTransmission"
import { VehicleOilsFilters } from "./VehicleOilsFilters"
import { VehicleTires } from "./VehicleTires"
import { VehicleMetrics } from "./VehicleMetrics"

interface VehicleDetailTabsProps {
  vehicle: any
  metricsData: any[]
  refuelRecords: any[]
  maintenanceRecords: any[]
}

export function VehicleDetailTabs({ vehicle, metricsData, refuelRecords, maintenanceRecords }: VehicleDetailTabsProps) {
  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic">Detalhes básicos</TabsTrigger>
        <TabsTrigger value="engine">Motor e transmissão</TabsTrigger>
        <TabsTrigger value="oils">Óleos e filtros</TabsTrigger>
        <TabsTrigger value="tires">Pneus</TabsTrigger>
        <TabsTrigger value="metrics">Métricas</TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <VehicleBasicDetails vehicle={vehicle} />
      </TabsContent>

      <TabsContent value="engine">
        <VehicleEngineTransmission vehicle={vehicle} />
      </TabsContent>

      <TabsContent value="oils">
        <VehicleOilsFilters vehicle={vehicle} />
      </TabsContent>

      <TabsContent value="tires">
        <VehicleTires vehicle={vehicle} />
      </TabsContent>

      <TabsContent value="metrics">
        <VehicleMetrics
          vehicle={vehicle}
          metricsData={metricsData}
          refuelRecords={refuelRecords}
          maintenanceRecords={maintenanceRecords}
        />
      </TabsContent>
    </Tabs>
  )
}
