import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Vehicle {
  status: string
}

interface FleetStatusProps {
  vehicles: Vehicle[]
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  inactive: "bg-red-100 text-red-800",
  retired: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  active: "Ativo",
  maintenance: "Manutenção",
  inactive: "Inativo",
  retired: "Retirado",
}

export function FleetStatus({ vehicles }: FleetStatusProps) {
  const statusCounts = vehicles.reduce(
    (acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado da Frota</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[status as keyof typeof statusColors]}>
                  {statusLabels[status as keyof typeof statusLabels]}
                </Badge>
              </div>
              <span className="text-sm font-medium">{count} veículos</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
