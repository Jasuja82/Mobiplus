import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Fuel } from "lucide-react"
import Link from "next/link"

interface RefuelRecord {
  id: string
  refuel_date: string
  total_cost: number
  liters: number
  vehicle?: {
    license_plate: string
    make: string
    model: string
  } | null
}

interface RecentActivityProps {
  refuels: RefuelRecord[]
}

export function RecentActivity({ refuels }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Atividade Recente</CardTitle>
        <Link href="/refuel" className="text-sm text-primary hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {refuels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
          ) : (
            refuels.map((refuel) => (
              <div key={refuel.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Fuel className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Abastecimento - {refuel.vehicle?.license_plate}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(refuel.refuel_date)} • {refuel.liters.toFixed(1)}L
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium">€{refuel.total_cost.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
