import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Extract filter parameters
    const timePeriod = searchParams.get("timePeriod") || "month"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Calculate date range
    const now = new Date()
    let dateFrom: Date
    let dateTo = new Date()

    if (startDate && endDate) {
      dateFrom = new Date(startDate)
      dateTo = new Date(endDate)
    } else {
      switch (timePeriod) {
        case "quarter":
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          break
        case "semester":
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 6, 1)
          break
        case "year":
          dateFrom = new Date(now.getFullYear() - 1, now.getMonth(), 1)
          break
        default:
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      }
    }

    // Fetch locations
    const { data: locations } = await supabase.from("locations").select("id, name").eq("is_active", true)

    // Fetch departments
    const { data: departments } = await supabase.from("departments").select("id, name")

    // Fetch vehicles
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, license_plate, internal_number")
      .neq("status", "retired")

    // Fetch assignment types
    const { data: assignments } = await supabase.from("assignment_types").select("id, name").eq("status", true)

    const { data: maintenanceData } = await supabase
      .from("maintenance_interventions")
      .select(`
        *,
        vehicles(license_plate, make, model, internal_number),
        schedule:maintenance_schedules(
          category:maintenance_categories(name)
        )
      `)
      .gte("intervention_date", dateFrom.toISOString())
      .lte("intervention_date", dateTo.toISOString())

    // Calculate real metrics
    const totalCost = maintenanceData?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0
    const totalInterventions = maintenanceData?.length || 0
    const averageCost = totalInterventions > 0 ? totalCost / totalInterventions : 0

    // Calculate average duration
    const durationsData = maintenanceData?.filter((m) => m.labor_hours) || []
    const averageDuration =
      durationsData.length > 0
        ? durationsData.reduce((sum, m) => sum + (m.labor_hours || 0), 0) / durationsData.length
        : 0

    // Calculate monthly trends
    const monthlyData =
      maintenanceData?.reduce(
        (acc, record) => {
          const month = new Date(record.intervention_date).toLocaleDateString("pt-PT", { month: "short" })
          if (!acc[month]) {
            acc[month] = { cost: 0, interventions: 0 }
          }
          acc[month].cost += record.total_cost || 0
          acc[month].interventions += 1
          return acc
        },
        {} as Record<string, { cost: number; interventions: number }>,
      ) || {}

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      cost: data.cost,
      interventions: data.interventions,
    }))

    const typeData =
      maintenanceData?.reduce(
        (acc, record) => {
          const type = record.schedule?.category?.name || "Other"
          if (!acc[type]) {
            acc[type] = { count: 0, cost: 0 }
          }
          acc[type].count += 1
          acc[type].cost += record.total_cost || 0
          return acc
        },
        {} as Record<string, { count: number; cost: number }>,
      ) || {}

    const maintenanceTypes = Object.entries(typeData).map(([name, data]) => ({
      name,
      value: data.count,
      cost: data.cost,
    }))

    // Calculate vehicle ranking by maintenance cost
    const vehicleRanking =
      vehicles
        ?.map((vehicle) => {
          const vehicleCost =
            maintenanceData
              ?.filter((m) => m.vehicle_id === vehicle.id)
              .reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0
          return {
            vehicle: vehicle.license_plate,
            cost: vehicleCost,
          }
        })
        .filter((v) => v.cost > 0)
        .sort((a, b) => b.cost - a.cost) || []

    const { data: upcomingMaintenance } = await supabase
      .from("maintenance_schedules")
      .select(`
        *,
        vehicle:vehicles(license_plate),
        category:maintenance_categories(name)
      `)
      .gte("scheduled_date", new Date().toISOString())
      .eq("status", "scheduled")
      .order("scheduled_date", { ascending: true })
      .limit(10)

    const upcomingMaintenanceFormatted =
      upcomingMaintenance?.map((m) => ({
        vehicle: m.vehicle?.license_plate || "Unknown",
        type: m.category?.name || "Unknown",
        date: new Date(m.scheduled_date).toLocaleDateString("pt-PT"),
        estimatedCost: m.estimated_cost || 0,
      })) || []

    // Calculate percentage changes
    const previousPeriodStart = new Date(dateFrom)
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
    const previousPeriodEnd = new Date(dateFrom)

    const { data: previousData } = await supabase
      .from("maintenance_interventions")
      .select("total_cost")
      .gte("intervention_date", previousPeriodStart.toISOString())
      .lt("intervention_date", previousPeriodEnd.toISOString())

    const previousCost = previousData?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0
    const previousInterventions = previousData?.length || 0

    const costChange = previousCost > 0 ? ((totalCost - previousCost) / previousCost) * 100 : 0
    const interventionsChange =
      previousInterventions > 0 ? ((totalInterventions - previousInterventions) / previousInterventions) * 100 : 0

    const responseData = {
      locations: locations || [],
      departments: departments || [],
      vehicles: vehicles || [],
      assignments: assignments || [],
      totalCost,
      totalInterventions,
      averageCost,
      averageDuration,
      costChange,
      interventionsChange,
      monthlyTrends,
      maintenanceTypes,
      vehicleRanking,
      upcomingMaintenance: upcomingMaintenanceFormatted,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching maintenance metrics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
