import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LocationsTable } from "@/components/locations/LocationsTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function LocationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get locations from enhanced schema
  const { data: locations, error } = await supabase
    .from("locations")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching locations:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Localizações</h1>
          <p className="text-muted-foreground">Gerir as localizações da frota MobiAzores</p>
        </div>
        <Link href="/locations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Localização
          </Button>
        </Link>
      </div>

      <LocationsTable locations={locations || []} />
    </div>
  )
}
