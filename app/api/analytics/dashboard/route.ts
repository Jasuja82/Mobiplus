import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Extract filter parameters
    const timePeriod = searchParams.get("timePeriod") || "month"
    const assignment = searchParams.get("assignment") || "all"
    const location = searchParams.get("location") || "all"
    const department = searchParams.get("department") || "all"
    const vehicle = searchParams.get("vehicle") || "all"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Calculate date range based on time period
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
        default: // month
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      }
    }

    // Fetch filter options
    const [locationsResult, departmentsResult, vehiclesResult] = await Promise.all([
      supabase.from("locations").select("id, name").order("name"),
      supabase.from("departments").select("id, name").order("name"),
      supabase.from("vehicles").select("id, license_plate").order("license_plate"),
    ])

    // Build dynamic query filters
    let vehicleQuery = supabase.from("vehicles").select("*")
    let refuelQuery = supabase.from("refuel_records").select("*")
    let maintenanceQuery = supabase.from("maintenance_interventions").select("*")

    // Apply filters
    if (location !== "all") {
      vehicleQuery = vehicleQuery.eq("location_id", location)
      refuelQuery = refuelQuery.eq("location_id", location)
    }

    if (department !== "all") {
      vehicleQuery = vehicleQuery.eq("department_id", department)
      refuelQuery = refuelQuery.eq("department_id", department)
    }

    if (vehicle !== "all") {
      refuelQuery = refuelQuery.eq("vehicle_id", vehicle)
      maintenanceQuery = maintenanceQuery.eq("vehicle_id", vehicle)
    }

    // Apply date filters
    refuelQuery = refuelQuery.gte("refuel_date", dateFrom.toISOString()).lte("refuel_date", dateTo.toISOString())

    maintenanceQuery = maintenanceQuery
      .gte("intervention_date", dateFrom.toISOString())
      .lte("intervention_date", dateTo.toISOString())

    // Execute queries
    const [vehiclesData, refuelData, maintenanceData] = await Promise.all([vehicleQuery, refuelQuery, maintenanceQuery])

    // Calculate analytics
    const totalCost =
      (refuelData.data?.reduce((sum, r) => sum + r.total_cost, 0) || 0) +
      (maintenanceData.data?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0)

    const totalFuel = refuelData.data?.reduce((sum, r) => sum + r.liters, 0) || 0
    const totalMaintenance = maintenanceData.data?.length || 0
    const totalKilometers = refuelData.data?.reduce((sum, r) => sum + (r.odometer_reading || 0), 0) || 0

    // Calculate previous period for comparison
    const prevDateFrom = new Date(dateFrom)
    const prevDateTo = new Date(dateFrom)
    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
    prevDateFrom.setDate(prevDateFrom.getDate() - daysDiff)

    const [prevRefuelData, prevMaintenanceData] = await Promise.all([
      supabase
        .from("refuel_records")
        .select("total_cost, liters")
        .gte("refuel_date", prevDateFrom.toISOString())
        .lte("refuel_date", dateFrom.toISOString()),
      supabase
        .from("maintenance_interventions")
        .select("total_cost")
        .gte("intervention_date", prevDateFrom.toISOString())
        .lte("intervention_date", dateFrom.toISOString()),
    ])

    const prevTotalCost =
      (prevRefuelData.data?.reduce((sum, r) => sum + r.total_cost, 0) || 0) +
      (prevMaintenanceData.data?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0)
    const prevTotalFuel = prevRefuelData.data?.reduce((sum, r) => sum + r.liters, 0) || 0

    // Calculate percentage changes
    const costChange = prevTotalCost > 0 ? (((totalCost - prevTotalCost) / prevTotalCost) * 100).toFixed(1) : 0
    const fuelChange = prevTotalFuel > 0 ? (((totalFuel - prevTotalFuel) / prevTotalFuel) * 100).toFixed(1) : 0

    return NextResponse.json({
      locations: locationsResult.data || [],
      departments: departmentsResult.data || [],
      vehicles: vehiclesResult.data || [],
      assignments: [
        { id: "operational", name: "Operacional" },
        { id: "administrative", name: "Administrativo" },
        { id: "maintenance", name: "Manutenção" },
      ],
      analytics: {
        totalCost,
        totalFuel,
        totalMaintenance,
        totalKilometers,
        costChange: Number(costChange),
        fuelChange: Number(fuelChange),
        maintenanceChange: 0,
        kilometersChange: 0,
        fuel: refuelData.data,
        maintenance: maintenanceData.data,
        fleet: vehiclesData.data,
      },
    })
  } catch (error) {
    console.error("Error fetching analytics dashboard data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
