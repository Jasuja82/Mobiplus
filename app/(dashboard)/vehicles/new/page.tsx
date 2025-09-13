import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VehicleForm } from "@/components/vehicles/VehicleForm"

export default async function NewVehiclePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get departments and categories for the form
  const [departmentsResult, categoriesResult] = await Promise.all([
    supabase.from("departments").select("*").order("name"),
    supabase.from("vehicle_categories").select("*").order("name"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Veículo</h1>
        <p className="text-muted-foreground">Adicione um novo veículo à frota da MobiAzores</p>
      </div>

      <VehicleForm departments={departmentsResult.data || []} categories={categoriesResult.data || []} />
    </div>
  )
}
