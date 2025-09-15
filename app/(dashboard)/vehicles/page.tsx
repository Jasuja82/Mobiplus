import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VehiclesTable } from "@/components/vehicles/VehiclesTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function VehiclesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: vehicles, error } = await supabase
    .from("vehicles_with_age")
    .select(`
      *,
      category:vehicle_categories(name),
      department:departments(name),
      latest_refuel:refuel_records(odometer_reading, refuel_date)
    `)
    .order("vehicle_number")

  if (error) {
    console.error("Error fetching vehicles:", error)
  }

  console.log(
    "[v0] Vehicle make/model data:",
    vehicles?.map((v) => ({
      id: v.id,
      internal_number: v.internal_number,
      make: v.make,
      model: v.model,
      make_type: typeof v.make,
      model_type: typeof v.model,
    })),
  )

  const processedVehicles =
    vehicles?.map((vehicle) => {
      // Get the latest refuel record's odometer reading
      const latestRefuel = vehicle.latest_refuel?.[0]
      const latestOdometer = latestRefuel?.odometer_reading || vehicle.current_mileage || 0

      return {
        ...vehicle,
        latest_odometer: latestOdometer,
      }
    }) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Veículos</h1>
          <p className="text-muted-foreground">Gerir a frota de veículos da MobiAzores</p>
        </div>
        <Link href="/vehicles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Veículo
          </Button>
        </Link>
      </div>

      <VehiclesTable vehicles={processedVehicles} />
    </div>
  )
}
