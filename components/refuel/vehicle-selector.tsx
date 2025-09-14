"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Car, Gauge, Calendar, TrendingUp } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface VehicleStats {
  lastOdometer: number
  avgEfficiency: number
  lastRefuelDate: string
  totalRefuels: number
}

interface Vehicle {
  id: string
  license_plate: string
  internal_number: string
  make: string
  model: string
}

interface VehicleSelectorProps {
  selectedVehicle: string
  onVehicleChange: (vehicleId: string) => void
  onVehicleStats: (stats: VehicleStats) => void
}

export function VehicleSelector({ selectedVehicle, onVehicleChange, onVehicleStats }: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    if (selectedVehicle) {
      fetchVehicleStats(selectedVehicle)
    }
  }, [selectedVehicle])

  const fetchVehicles = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data, error } = await supabase
        .from("vehicles")
        .select("id, license_plate, internal_number, make, model")
        .eq("is_active", true)
        .order("internal_number")

      if (error) {
        console.error("Error fetching vehicles:", error)
        return
      }

      setVehicles(data || [])
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleStats = async (vehicleId: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data: refuelData, error } = await supabase
        .from("refuel_records")
        .select("refuel_date, odometer_reading, liters, calculated_odometer_difference")
        .eq("vehicle_id", vehicleId)
        .order("refuel_date", { ascending: false })

      if (error) {
        console.error("Error fetching vehicle stats:", error)
        return
      }

      if (refuelData && refuelData.length > 0) {
        const lastRefuel = refuelData[0]
        const totalRefuels = refuelData.length

        // Calculate average efficiency
        const efficiencyRecords = refuelData.filter((r) => r.calculated_odometer_difference && r.liters)
        const avgEfficiency =
          efficiencyRecords.length > 0
            ? efficiencyRecords.reduce((sum, r) => sum + (r.liters / r.calculated_odometer_difference!) * 100, 0) /
              efficiencyRecords.length
            : 0

        const stats = {
          lastOdometer: lastRefuel.odometer_reading,
          avgEfficiency: Math.round(avgEfficiency * 10) / 10,
          lastRefuelDate: new Date(lastRefuel.refuel_date).toLocaleDateString("pt-PT"),
          totalRefuels,
        }

        setVehicleStats(stats)
        onVehicleStats(stats)
      }
    } catch (error) {
      console.error("Error fetching vehicle stats:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading vehicles...</div>
        </CardContent>
      </Card>
    )
  }

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
                  <span className="font-medium">{vehicle.internal_number}</span>
                  <span className="text-sm text-muted-foreground">{vehicle.license_plate}</span>
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
