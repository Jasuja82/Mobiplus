import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InteractiveAnalyticsDashboard } from "@/components/analytics/InteractiveAnalyticsDashboard"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return <InteractiveAnalyticsDashboard />
}
