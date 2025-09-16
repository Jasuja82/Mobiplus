import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only redirect if user is authenticated
  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
