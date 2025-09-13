"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Car, Gauge, Calendar, TrendingUp } from "lucide-react"

interface VehicleStats {
  lastOdometer: number
  avgEfficiency: number
  lastRefuelDate: string
  totalRefuels: number
}

interface VehicleSelectorProps {
  selectedVehicle: string
  onVehicleChange: (vehicleId: string) => void
  onVehicleStats: (stats: VehicleStats) => void
}

export function VehicleSelector({ selectedVehicle, onVehicleChange, onVehicleStats }: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockVehicles = [
      { id: "VH001", license_plate: "12-AB-34", make: "Toyota", model: "Corolla" },
      { id: "VH002", license_plate: "56-CD-78", make: "Volkswagen", model: "Golf" },
      { id: "VH003", license_plate: "90-EF-12", make: "Ford", model: "Focus" },
    ]
    setVehicles(mockVehicles)
  }, [])

  useEffect(() => {
    if (selectedVehicle) {
      // Mock stats - replace with actual API call
      const mockStats = {
        lastOdometer: 45230,
        avgEfficiency: 7.2,
        lastRefuelDate: "2024-01-15",
        totalRefuels: 23,
      }
      setVehicleStats(mockStats)
      onVehicleStats(mockStats)
    }
  }, [selectedVehicle, onVehicleStats])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedVehicle} onValueChange={onVehicleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{vehicle.license_plate}</span>
                  <span className="text-sm text-muted-foreground">
                    {vehicle.make} {vehicle.model}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {vehicleStats && selectedVehicle && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                <span className="text-sm font-medium">Last Odometer</span>
              </div>
              <Badge variant="outline">{vehicleStats.lastOdometer.toLocaleString()} km</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Avg Efficiency</span>
              </div>
              <Badge variant="outline">{vehicleStats.avgEfficiency} L/100km</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Last Refuel</span>
              </div>
              <Badge variant="outline">{vehicleStats.lastRefuelDate}</Badge>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Total refuels: {vehicleStats.totalRefuels}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
