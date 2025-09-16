import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DatabaseHealthPage } from "@/components/admin/DatabaseHealthPage"

export default async function DatabaseHealthPageRoute() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return <DatabaseHealthPage />
}
