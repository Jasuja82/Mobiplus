"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Fuel } from "lucide-react"

interface RecentRefuelsProps {
  vehicleId: string
}

export function RecentRefuels({ vehicleId }: RecentRefuelsProps) {
  const [recentRefuels, setRecentRefuels] = useState<any[]>([])

  useEffect(() => {
    if (vehicleId) {
      // Mock data - replace with actual API call
      const mockRefuels = [
        {
          id: "1",
          date: "2024-01-15",
          odometer: 45230,
          liters: 42.5,
          cost: 68.5,
          location: "Galp - Ponta Delgada",
          efficiency: 7.2,
        },
        {
          id: "2",
          date: "2024-01-08",
          odometer: 44830,
          liters: 38.2,
          cost: 61.2,
          location: "BP - Ribeira Grande",
          efficiency: 6.8,
        },
        {
          id: "3",
          date: "2024-01-02",
          odometer: 44430,
          liters: 41.0,
          cost: 65.8,
          location: "Repsol - Lagoa",
          efficiency: 7.5,
        },
      ]
      setRecentRefuels(mockRefuels)
    }
  }, [vehicleId])

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
            {recentRefuels.map((refuel) => (
              <div key={refuel.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{refuel.date}</span>
                  <Badge variant="outline">{refuel.odometer.toLocaleString()} km</Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    {refuel.liters}L
                  </div>
                  <div>€{refuel.cost}</div>
                  <div>{refuel.efficiency} L/100km</div>
                </div>

                <div className="text-xs text-muted-foreground truncate">{refuel.location}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
