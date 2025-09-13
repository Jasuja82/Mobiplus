import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VehicleDetailTabs } from "@/components/vehicles/VehicleDetailTabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface VehicleDetailPageProps {
  params: {
    id: string
  }
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get vehicle with all related data
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      category:vehicle_categories(name),
      department:departments(name),
      home_location:locations!vehicles_home_location_id_fkey(name, address),
      current_location:locations!vehicles_current_location_id_fkey(name, address)
    `)
    .eq("id", params.id)
    .single()

  if (error || !vehicle) {
    redirect("/vehicles")
  }

  // Get vehicle metrics data
  const { data: metricsData } = await supabase
    .from("monthly_fuel_analytics_by_vehicle")
    .select("*")
    .eq("vehicle_id", params.id)
    .order("month", { ascending: false })

  // Get refuel records for this vehicle
  const { data: refuelRecords } = await supabase
    .from("refuel_records")
    .select("*")
    .eq("vehicle_id", params.id)
    .order("refuel_date", { ascending: false })
    .limit(10)

  // Get maintenance records
  const { data: maintenanceRecords } = await supabase
    .from("maintenance_interventions")
    .select(`
      *,
      schedule:maintenance_schedules(
        category:maintenance_categories(name)
      )
    `)
    .eq("vehicle_id", params.id)
    .order("intervention_date", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vehicles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à lista
            </Button>
          </Link>
        </div>
      </div>

      {/* Vehicle Header */}
      <div className="bg-muted/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Detalhes do veículo</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
                {vehicle.license_plate}
              </span>
              <span className="text-lg font-semibold">{vehicle.internal_number || vehicle.vehicle_number}</span>
              <span className="text-sm text-muted-foreground">#{vehicle.internal_number}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">ID: {vehicle.id}</p>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <VehicleDetailTabs
        vehicle={vehicle}
        metricsData={metricsData || []}
        refuelRecords={refuelRecords || []}
        maintenanceRecords={maintenanceRecords || []}
      />
    </div>
  )
}
