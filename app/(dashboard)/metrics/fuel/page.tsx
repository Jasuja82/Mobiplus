import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FuelMetricsDashboard } from "@/components/metrics/FuelMetricsDashboard"

export default async function FuelMetricsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return <FuelMetricsDashboard />
}
