import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VehicleForm } from "@/components/vehicles/VehicleForm"

interface VehicleEditPageProps {
  params: {
    id: string
  }
}

export default async function VehicleEditPage({ params }: VehicleEditPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the vehicle to edit
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", params.id)
    .single()

  if (vehicleError || !vehicle) {
    redirect("/vehicles")
  }

  // Get departments for the form
  const { data: departments } = await supabase.from("departments").select("id, name").order("name")

  // Get vehicle categories for the form
  const { data: categories } = await supabase.from("vehicle_categories").select("id, name").order("name")

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-6">
        <h1 className="text-2xl font-bold">Editar Veículo</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
            {vehicle.license_plate}
          </span>
          <span className="text-lg font-semibold">{vehicle.internal_number}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {vehicle.make} {vehicle.model} ({vehicle.year})
        </p>
      </div>

      <VehicleForm departments={departments || []} categories={categories || []} vehicle={vehicle} />
    </div>
  )
}
