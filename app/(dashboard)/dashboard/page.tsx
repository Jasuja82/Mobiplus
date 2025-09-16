import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { FleetStatus } from "@/components/dashboard/FleetStatus"
import { FleetOverviewCharts } from "@/components/dashboard/fleet-overview-charts"
import { FuelAnalyticsCharts } from "@/components/dashboard/fuel-analytics-charts"
import { MaintenanceAnalytics } from "@/components/dashboard/maintenance-analytics"
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const [vehiclesResult, recentRefuelsResult] = await Promise.all([
    supabase.from("vehicles").select("status"),
    supabase.from("refuel_summary").select("*").order("refuel_date", { ascending: false }).limit(5),
  ])

  const vehicleStats = {
    total: vehiclesResult.data?.length || 0,
    active: vehiclesResult.data?.filter((v) => v.status === "active").length || 0,
    maintenance: vehiclesResult.data?.filter((v) => v.status === "maintenance").length || 0,
    inactive: vehiclesResult.data?.filter((v) => v.status === "retired").length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da gestão da frota MobiAzores</p>
      </div>

      <DashboardOverview vehicleStats={vehicleStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FleetStatus vehicles={vehiclesResult.data || []} />
      </div>

      <RecentActivity refuels={recentRefuelsResult.data || []} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Fleet Overview</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FleetOverviewCharts />
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <FuelAnalyticsCharts filters={{}} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceAnalytics filters={{}} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
