import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LocationForm } from "@/components/locations/LocationForm"

export default async function EditLocationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get location data
  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select("*")
    .eq("id", params.id)
    .single()

  if (locationError || !location) {
    redirect("/locations")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Localização</h1>
        <p className="text-muted-foreground">Edite os dados da localização {location.name}</p>
      </div>

      <LocationForm location={location} />
    </div>
  )
}
