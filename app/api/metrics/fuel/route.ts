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
    const { data: departments } = await supabase.from("departments").select("id, name").eq("is_active", true)

    // Fetch vehicles
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, license_plate, vehicle_internal_number")
      .eq("is_active", true)

    // Fetch assignments (real assignments, not types)
    const { data: assignments } = await supabase.from("assignments").select("id, name").eq("is_active", true)

    // Fetch fuel data with related information
    const { data: fuelData } = await supabase
      .from("refuel_records")
      .select(`
        *,
        vehicles(license_plate, make, model, vehicle_internal_number),
        fuel_stations(name),
        drivers(name)
      `)
      .gte("refuel_date", dateFrom.toISOString())
      .lte("refuel_date", dateTo.toISOString())

    // Calculate real metrics from data
    const totalCost = fuelData?.reduce((sum, r) => sum + (r.total_cost || 0), 0) || 0
    const totalLiters = fuelData?.reduce((sum, r) => sum + (r.liters || 0), 0) || 0
    const averagePrice = totalLiters > 0 ? totalCost / totalLiters : 0
    const totalRefuels = fuelData?.length || 0

    // Calculate average consumption
    const consumptionData = fuelData?.filter((r) => r.distance_since_last_refuel && r.liters) || []
    const averageConsumption =
      consumptionData.length > 0
        ? consumptionData.reduce((sum, r) => sum + (r.liters / r.distance_since_last_refuel) * 100, 0) /
          consumptionData.length
        : 0

    // Calculate monthly trends
    const monthlyData =
      fuelData?.reduce(
        (acc, record) => {
          const month = new Date(record.refuel_date).toLocaleDateString("pt-PT", { month: "short" })
          if (!acc[month]) {
            acc[month] = { cost: 0, liters: 0 }
          }
          acc[month].cost += record.total_cost || 0
          acc[month].liters += record.liters || 0
          return acc
        },
        {} as Record<string, { cost: number; liters: number }>,
      ) || {}

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      cost: data.cost,
      liters: data.liters,
    }))

    // Calculate price history by month
    const priceHistory = Object.entries(monthlyData).map(([month, data]) => ({
      date: month,
      price: data.liters > 0 ? data.cost / data.liters : 0,
    }))

    // Calculate vehicle efficiency
    const vehicleEfficiency =
      vehicles
        ?.map((vehicle) => {
          const vehicleRecords =
            fuelData?.filter((r) => r.vehicle_id === vehicle.id && r.distance_since_last_refuel && r.liters) || []
          const avgConsumption =
            vehicleRecords.length > 0
              ? vehicleRecords.reduce((sum, r) => sum + (r.liters / r.distance_since_last_refuel) * 100, 0) /
                vehicleRecords.length
              : 0
          return {
            vehicle: vehicle.license_plate,
            consumption: avgConsumption,
          }
        })
        .filter((v) => v.consumption > 0) || []

    // Calculate station costs
    const stationData =
      fuelData?.reduce(
        (acc, record) => {
          const station = record.fuel_stations?.name || "Unknown"
          if (!acc[station]) {
            acc[station] = { cost: 0, liters: 0 }
          }
          acc[station].cost += record.total_cost || 0
          acc[station].liters += record.liters || 0
          return acc
        },
        {} as Record<string, { cost: number; liters: number }>,
      ) || {}

    const stationCosts = Object.entries(stationData).map(([station, data]) => ({
      station,
      cost: data.cost,
    }))

    const stationPrices = Object.entries(stationData).map(([station, data]) => ({
      station,
      averagePrice: data.liters > 0 ? data.cost / data.liters : 0,
    }))

    // Calculate vehicle ranking by cost
    const vehicleRanking =
      vehicles
        ?.map((vehicle) => {
          const vehicleCost =
            fuelData?.filter((r) => r.vehicle_id === vehicle.id).reduce((sum, r) => sum + (r.total_cost || 0), 0) || 0
          return {
            vehicle: vehicle.license_plate,
            cost: vehicleCost,
          }
        })
        .filter((v) => v.cost > 0)
        .sort((a, b) => b.cost - a.cost) || []

    // Calculate percentage changes (comparing to previous period)
    const previousPeriodStart = new Date(dateFrom)
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
    const previousPeriodEnd = new Date(dateFrom)

    const { data: previousData } = await supabase
      .from("refuel_records")
      .select("total_cost, liters")
      .gte("refuel_date", previousPeriodStart.toISOString())
      .lt("refuel_date", previousPeriodEnd.toISOString())

    const previousCost = previousData?.reduce((sum, r) => sum + (r.total_cost || 0), 0) || 0
    const previousLiters = previousData?.reduce((sum, r) => sum + (r.liters || 0), 0) || 0
    const previousRefuels = previousData?.length || 0

    const costChange = previousCost > 0 ? ((totalCost - previousCost) / previousCost) * 100 : 0
    const litersChange = previousLiters > 0 ? ((totalLiters - previousLiters) / previousLiters) * 100 : 0
    const refuelsChange = previousRefuels > 0 ? ((totalRefuels - previousRefuels) / previousRefuels) * 100 : 0

    const responseData = {
      locations: locations || [],
      departments: departments || [],
      vehicles: vehicles || [],
      assignments: assignments || [],
      totalCost,
      totalLiters,
      averagePrice,
      averageConsumption,
      totalRefuels,
      costChange,
      litersChange,
      refuelsChange,
      monthlyTrends,
      priceHistory,
      vehicleEfficiency,
      stationCosts,
      stationPrices,
      vehicleRanking,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching fuel metrics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
