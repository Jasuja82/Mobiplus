import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MileageMetricsDashboard } from "@/components/metrics/MileageMetricsDashboard"

export default async function MileageMetricsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return <MileageMetricsDashboard />
}
