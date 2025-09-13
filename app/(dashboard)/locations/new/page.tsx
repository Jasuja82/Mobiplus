import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LocationForm } from "@/components/locations/LocationForm"

export default async function NewLocationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Localização</h1>
        <p className="text-muted-foreground">Adicione uma nova localização à MobiAzores</p>
      </div>

      <LocationForm />
    </div>
  )
}
