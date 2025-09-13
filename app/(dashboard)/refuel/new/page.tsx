import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RefuelForm } from "@/components/refuel/RefuelForm"

export default async function NewRefuelPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get vehicles and drivers for the form
  const [vehiclesResult, driversResult] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, license_plate, make, model, current_mileage, fuel_capacity")
      .eq("status", "active")
      .order("license_plate"),
    supabase
      .from("drivers")
      .select(`
        id,
        license_number,
        user:users(name)
      `)
      .eq("is_active", true)
      .order("license_number"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registar Abastecimento</h1>
        <p className="text-muted-foreground">Adicionar novo registo de abastecimento</p>
      </div>

      <RefuelForm vehicles={vehiclesResult.data || []} drivers={driversResult.data || []} currentUserId={user.id} />
    </div>
  )
}
