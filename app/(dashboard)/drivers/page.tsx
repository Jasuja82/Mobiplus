import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DriversTable } from "@/components/drivers/DriversTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DriversPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  console.log("[v0] Fetching drivers for user:", user.id)

  // Get drivers with related data
  const { data: drivers, error } = await supabase
    .from("drivers")
    .select(`
      *,
      user:users(name, email, phone),
      department:departments(name)
    `)
    .order("created_at", { ascending: false })

  console.log("[v0] Drivers query result:", { drivers, error })
  console.log("[v0] Number of drivers found:", drivers?.length || 0)

  if (error) {
    console.error("[v0] Error fetching drivers:", error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Condutores</h1>
            <p className="text-muted-foreground">Gerir os condutores da frota MobiAzores</p>
          </div>
          <Link href="/drivers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Condutor
            </Button>
          </Link>
        </div>

        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="text-red-800 font-medium">Erro ao carregar condutores</h3>
          <p className="text-red-600 text-sm mt-1">{error.message || "Ocorreu um erro inesperado"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Condutores</h1>
          <p className="text-muted-foreground">Gerir os condutores da frota MobiAzores</p>
        </div>
        <Link href="/drivers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Condutor
          </Button>
        </Link>
      </div>

      <DriversTable drivers={drivers || []} />
    </div>
  )
}
