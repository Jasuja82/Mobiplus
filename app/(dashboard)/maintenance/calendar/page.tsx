import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MaintenanceCalendar } from "@/components/maintenance/MaintenanceCalendar"

export default async function MaintenanceCalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get maintenance schedules for calendar
  const { data: schedules, error } = await supabase
    .from("maintenance_schedules")
    .select(`
      *,
      vehicle:vehicles(license_plate, make, model),
      category:maintenance_categories(name)
    `)
    .in("status", ["scheduled", "in_progress"])
    .order("scheduled_date", { ascending: true })

  if (error) {
    console.error("Error fetching maintenance schedules:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendário de Manutenção</h1>
        <p className="text-muted-foreground">Vista de calendário das manutenções agendadas</p>
      </div>

      <MaintenanceCalendar schedules={schedules || []} />
    </div>
  )
}
