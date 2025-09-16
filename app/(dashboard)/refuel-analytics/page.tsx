import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RefuelAnalyticsPage } from "@/components/refuel/RefuelAnalyticsPage"

export default async function RefuelAnalyticsPageRoute() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return <RefuelAnalyticsPage />
}
