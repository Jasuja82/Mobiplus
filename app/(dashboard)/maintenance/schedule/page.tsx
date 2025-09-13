import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MaintenanceScheduleForm } from "@/components/maintenance/MaintenanceScheduleForm"

export default async function ScheduleMaintenancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get vehicles and categories for the form
  const [vehiclesResult, categoriesResult] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, license_plate, make, model, current_mileage")
      .eq("status", "active")
      .order("license_plate"),
    supabase.from("maintenance_categories").select("*").order("name"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendar Manutenção</h1>
        <p className="text-muted-foreground">Programar nova manutenção para um veículo</p>
      </div>

      <MaintenanceScheduleForm
        vehicles={vehiclesResult.data || []}
        categories={categoriesResult.data || []}
        currentUserId={user.id}
      />
    </div>
  )
}
