"use client"

import { useState } from "react"
import { Fuel } from "lucide-react"
import { ManualRefuelForm } from "@/components/refuel/manual-refuel-form"
import { RecentRefuels } from "@/components/refuel/recent-refuels"
import { VehicleSelector } from "@/components/refuel/vehicle-selector"

export default function RefuelPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [lastOdometer, setLastOdometer] = useState<number>(0)
  const [avgEfficiency, setAvgEfficiency] = useState<number>(0)
  const [lastRefuelDate, setLastRefuelDate] = useState<string>("")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Fuel className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Manual Refuel Entry</h1>
          <p className="text-muted-foreground">Record fuel transactions with intelligent validation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ManualRefuelForm
            selectedVehicle={selectedVehicle}
            onVehicleChange={setSelectedVehicle}
            lastOdometer={lastOdometer}
            avgEfficiency={avgEfficiency}
            lastRefuelDate={lastRefuelDate}
          />
        </div>

        <div className="space-y-6">
          <VehicleSelector
            selectedVehicle={selectedVehicle}
            onVehicleChange={setSelectedVehicle}
            onVehicleStats={(stats) => {
              setLastOdometer(stats.lastOdometer)
              setAvgEfficiency(stats.avgEfficiency)
              setLastRefuelDate(stats.lastRefuelDate)
            }}
          />

          {selectedVehicle && <RecentRefuels vehicleId={selectedVehicle} />}
        </div>
      </div>
    </div>
  )
}
