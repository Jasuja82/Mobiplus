import { createClient } from "@/lib/supabase/server"
import { AuthProvider } from "@/hooks/use-auth.tsx"
import SettingsContent from "@/components/settings/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()

  // Get user data server-side for SSR
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

  return (
    <AuthProvider initialUser={initialUser}>
      <SettingsContent />
    </AuthProvider>
  )
}

export const dynamic = "force-dynamic"
