import { createClient } from "@/lib/supabase/server"
import SettingsClientWrapper from "./settings-client-wrapper"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  let initialUser = null
  if (authUser) {
    const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()
    if (profile) {
      initialUser = {
        id: authUser.id,
        email: authUser.email!,
        ...profile,
      }
    }
  }

  return <SettingsClientWrapper />
}

export const dynamic = "force-dynamic"
