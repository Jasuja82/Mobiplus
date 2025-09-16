"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Fuel } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface RecentRefuelsProps {
  vehicleId: string
}

interface RefuelRecord {
  id: string
  refuel_date: string
  odometer_reading: number
  liters: number
  total_cost: number
  odometer_difference: number | null
  fuel_stations: { name: string } | null
}

export function RecentRefuels({ vehicleId }: RecentRefuelsProps) {
  const [recentRefuels, setRecentRefuels] = useState<RefuelRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (vehicleId) {
      fetchRecentRefuels()
    }
  }, [vehicleId])

  const fetchRecentRefuels = async () => {
    try {
      setLoading(true)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data, error } = await supabase
        .from("refuel_records")
        .select(`
          id,
          refuel_date,
          odometer_reading,
          liters,
          total_cost,
          odometer_difference,
          fuel_stations(name)
        `)
        .eq("vehicle_id", vehicleId)
        .order("refuel_date", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching recent refuels:", error)
        return
      }

      setRecentRefuels(data || [])
    } catch (error) {
      console.error("Error fetching recent refuels:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateEfficiency = (liters: number, distance: number | null) => {
    if (!distance || distance <= 0) return null
    return (liters / distance) * 100
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Refuels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Refuels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {recentRefuels.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No refuel records found for this vehicle</div>
            ) : (
              recentRefuels.map((refuel) => {
                const efficiency = calculateEfficiency(refuel.liters, refuel.odometer_difference)
                return (
                  <div key={refuel.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {new Date(refuel.refuel_date).toLocaleDateString("pt-PT")}
                      </span>
                      <Badge variant="outline">{refuel.odometer_reading.toLocaleString()} km</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        {refuel.liters}L
                      </div>
                      <div>€{refuel.total_cost.toFixed(2)}</div>
                      {efficiency && <div>{efficiency.toFixed(1)} L/100km</div>}
                    </div>

                    <div className="text-xs text-muted-foreground truncate">
                      {refuel.fuel_stations?.name || "Unknown Station"}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
