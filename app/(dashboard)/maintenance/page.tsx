import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MaintenanceOverview } from "@/components/maintenance/MaintenanceOverview"
import { MaintenanceScheduleTable } from "@/components/maintenance/MaintenanceScheduleTable"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"
import Link from "next/link"

export default async function MaintenancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get maintenance schedules with related data
  const { data: schedules, error } = await supabase
    .from("maintenance_schedules")
    .select(`
      *,
      vehicle:vehicles(license_plate, make, model, current_mileage),
      category:maintenance_categories(name, description),
      created_by_user:users!maintenance_schedules_created_by_fkey(name)
    `)
    .order("scheduled_date", { ascending: true })
    .limit(50)

  if (error) {
    console.error("Error fetching maintenance schedules:", error)
  }

  // Get statistics
  const [scheduledResult, overdueResult, completedResult] = await Promise.all([
    supabase.from("maintenance_schedules").select("id").eq("status", "scheduled"),
    supabase
      .from("maintenance_schedules")
      .select("id")
      .eq("status", "scheduled")
      .lt("scheduled_date", new Date().toISOString()),
    supabase
      .from("maintenance_schedules")
      .select("id")
      .eq("status", "completed")
      .gte("updated_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  const stats = {
    scheduled: scheduledResult.data?.length || 0,
    overdue: overdueResult.data?.length || 0,
    completed: completedResult.data?.length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Manutenção</h1>
          <p className="text-muted-foreground">Planeamento e controlo de manutenção da frota</p>
        </div>
        <div className="flex gap-2">
          <Link href="/maintenance/calendar">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Calendário
            </Button>
          </Link>
          <Link href="/maintenance/schedule">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar Manutenção
            </Button>
          </Link>
        </div>
      </div>

      <MaintenanceOverview stats={stats} />

      <MaintenanceScheduleTable schedules={schedules || []} />
    </div>
  )
}
