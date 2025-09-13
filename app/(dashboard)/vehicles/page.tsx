import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VehiclesTable } from "@/components/vehicles/VehiclesTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function VehiclesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get vehicles with related data
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      category:vehicle_categories(name),
      department:departments(name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vehicles:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Veículos</h1>
          <p className="text-muted-foreground">Gerir a frota de veículos da MobiAzores</p>
        </div>
        <Link href="/vehicles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Veículo
          </Button>
        </Link>
      </div>

      <VehiclesTable vehicles={vehicles || []} />
    </div>
  )
}
