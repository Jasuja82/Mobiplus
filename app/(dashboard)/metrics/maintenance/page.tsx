import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MaintenanceMetricsDashboard } from "@/components/metrics/MaintenanceMetricsDashboard"

export default async function MaintenanceMetricsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return <MaintenanceMetricsDashboard />
}
