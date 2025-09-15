import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Vehicle {
  status: string
}

interface FleetStatusProps {
  vehicles: Vehicle[]
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
                <span className="text-sm font-medium">{statusLabels[status as keyof typeof statusLabels]}</span>
              </div>
              <span className="text-sm font-medium">{count} veículos</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
