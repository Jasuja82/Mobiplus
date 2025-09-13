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

  // Get drivers with related data
  const { data: drivers, error } = await supabase
    .from("drivers")
    .select(`
      *,
      user:users(name, email, phone),
      department:departments(name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching drivers:", error)
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
