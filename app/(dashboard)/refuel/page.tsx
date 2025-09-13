import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RefuelTable } from "@/components/refuel/RefuelTable"
import { RefuelStats } from "@/components/refuel/RefuelStats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function RefuelPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get refuel records with related data
  const { data: refuelRecords, error } = await supabase
    .from("refuel_records")
    .select(`
      *,
      vehicle:vehicles(license_plate, make, model),
      driver:drivers(
        license_number,
        user:users(name)
      ),
      created_by_user:users!refuel_records_created_by_fkey(name)
    `)
    .order("refuel_date", { ascending: false })
    .limit(50)

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, license_plate, make, model")
    .eq("status", "active")
    .order("license_plate")

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, license_number, user:users(name)")
    .eq("status", "active")
    .order("license_number")

  if (error) {
    console.error("Error fetching refuel records:", error)
  }

  // Get statistics for current month
  const currentMonth = new Date()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

  const { data: monthlyStats } = await supabase
    .from("refuel_records")
    .select("total_cost, liters")
    .gte("refuel_date", firstDayOfMonth.toISOString())

  const totalCost = monthlyStats?.reduce((sum, record) => sum + record.total_cost, 0) || 0
  const totalLiters = monthlyStats?.reduce((sum, record) => sum + record.liters, 0) || 0
  const averageCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Abastecimentos</h1>
          <p className="text-muted-foreground">Controlo de combustível e custos da frota</p>
        </div>
        <Link href="/refuel/manual">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registar Abastecimento
          </Button>
        </Link>
      </div>

      <RefuelStats
        totalCost={totalCost}
        totalLiters={totalLiters}
        averageCostPerLiter={averageCostPerLiter}
        recordCount={monthlyStats?.length || 0}
      />

      <RefuelTable refuelRecords={refuelRecords || []} vehicles={vehicles || []} drivers={drivers || []} />
    </div>
  )
}
