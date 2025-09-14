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

    // Fetch assignment types
    const { data: assignments } = await supabase.from("assignment_types").select("id, name").eq("is_active", true)

    // Fetch refuel data to calculate mileage metrics
    const { data: refuelData } = await supabase
      .from("refuel_records")
      .select(`
        *,
        vehicles(license_plate, make, model)
      `)
      .gte("refuel_date", dateFrom.toISOString())
      .lte("refuel_date", dateTo.toISOString())
      .not("distance_since_last_refuel", "is", null)
      .order("refuel_date", { ascending: true })

    // Calculate real metrics
    const totalKilometers = refuelData?.reduce((sum, r) => sum + (r.distance_since_last_refuel || 0), 0) || 0
    const totalTrips = refuelData?.length || 0
    const daysInPeriod = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
    const averageDaily = daysInPeriod > 0 ? totalKilometers / daysInPeriod : 0

    // Calculate utilization rate (assuming 8 hours/day as full utilization)
    const utilizationRate =
      totalTrips > 0 ? Math.min((totalTrips / (daysInPeriod * vehicles?.length || 1)) * 100, 100) : 0

    // Calculate efficiency (km per liter)
    const totalLiters = refuelData?.reduce((sum, r) => sum + (r.liters || 0), 0) || 0
    const efficiency = totalLiters > 0 ? totalKilometers / totalLiters : 0

    // Calculate monthly trends
    const monthlyData =
      refuelData?.reduce(
        (acc, record) => {
          const month = new Date(record.refuel_date).toLocaleDateString("pt-PT", { month: "short" })
          if (!acc[month]) {
            acc[month] = { kilometers: 0, trips: 0 }
          }
          acc[month].kilometers += record.distance_since_last_refuel || 0
          acc[month].trips += 1
          return acc
        },
        {} as Record<string, { kilometers: number; trips: number }>,
      ) || {}

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      kilometers: data.kilometers,
      trips: data.trips,
    }))

    // Calculate vehicle utilization
    const vehicleUtilization =
      vehicles
        ?.map((vehicle) => {
          const vehicleRecords = refuelData?.filter((r) => r.vehicle_id === vehicle.id) || []
          const vehicleKm = vehicleRecords.reduce((sum, r) => sum + (r.distance_since_last_refuel || 0), 0)
          const utilization =
            vehicleRecords.length > 0 ? Math.min((vehicleRecords.length / daysInPeriod) * 100, 100) : 0
          return {
            vehicle: vehicle.license_plate,
            utilization: Math.round(utilization),
          }
        })
        .filter((v) => v.utilization > 0) || []

    // Calculate utilization distribution
    const utilizationRanges = [
      { range: "0-25%", vehicles: 0 },
      { range: "26-50%", vehicles: 0 },
      { range: "51-75%", vehicles: 0 },
      { range: "76-100%", vehicles: 0 },
    ]

    vehicleUtilization.forEach((v) => {
      if (v.utilization <= 25) utilizationRanges[0].vehicles++
      else if (v.utilization <= 50) utilizationRanges[1].vehicles++
      else if (v.utilization <= 75) utilizationRanges[2].vehicles++
      else utilizationRanges[3].vehicles++
    })

    // Calculate efficiency trends by month
    const efficiencyTrends = Object.entries(monthlyData).map(([month, data]) => {
      const monthRecords =
        refuelData?.filter((r) => new Date(r.refuel_date).toLocaleDateString("pt-PT", { month: "short" }) === month) ||
        []
      const monthLiters = monthRecords.reduce((sum, r) => sum + (r.liters || 0), 0)
      const monthEfficiency = monthLiters > 0 ? data.kilometers / monthLiters : 0
      return {
        month,
        efficiency: Math.round(monthEfficiency * 10) / 10,
      }
    })

    // Calculate vehicle efficiency
    const vehicleEfficiency =
      vehicles
        ?.map((vehicle) => {
          const vehicleRecords = refuelData?.filter((r) => r.vehicle_id === vehicle.id) || []
          const vehicleKm = vehicleRecords.reduce((sum, r) => sum + (r.distance_since_last_refuel || 0), 0)
          const vehicleLiters = vehicleRecords.reduce((sum, r) => sum + (r.liters || 0), 0)
          const efficiency = vehicleLiters > 0 ? vehicleKm / vehicleLiters : 0
          return {
            vehicle: vehicle.license_plate,
            efficiency: Math.round(efficiency * 10) / 10,
          }
        })
        .filter((v) => v.efficiency > 0) || []

    // Calculate vehicle ranking by kilometers
    const vehicleRanking =
      vehicles
        ?.map((vehicle) => {
          const vehicleKm =
            refuelData
              ?.filter((r) => r.vehicle_id === vehicle.id)
              .reduce((sum, r) => sum + (r.distance_since_last_refuel || 0), 0) || 0
          return {
            vehicle: vehicle.license_plate,
            kilometers: vehicleKm,
          }
        })
        .filter((v) => v.kilometers > 0)
        .sort((a, b) => b.kilometers - a.kilometers) || []

    // Calculate percentage changes
    const previousPeriodStart = new Date(dateFrom)
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
    const previousPeriodEnd = new Date(dateFrom)

    const { data: previousData } = await supabase
      .from("refuel_records")
      .select("distance_since_last_refuel")
      .gte("refuel_date", previousPeriodStart.toISOString())
      .lt("refuel_date", previousPeriodEnd.toISOString())
      .not("distance_since_last_refuel", "is", null)

    const previousKilometers = previousData?.reduce((sum, r) => sum + (r.distance_since_last_refuel || 0), 0) || 0
    const previousTrips = previousData?.length || 0

    const kilometersChange =
      previousKilometers > 0 ? ((totalKilometers - previousKilometers) / previousKilometers) * 100 : 0
    const tripsChange = previousTrips > 0 ? ((totalTrips - previousTrips) / previousTrips) * 100 : 0

    const responseData = {
      locations: locations || [],
      departments: departments || [],
      vehicles: vehicles || [],
      assignments: assignments || [],
      totalKilometers,
      averageDaily: Math.round(averageDaily),
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
      totalTrips,
      kilometersChange: Math.round(kilometersChange * 10) / 10,
      tripsChange: Math.round(tripsChange * 10) / 10,
      monthlyTrends,
      vehicleUtilization,
      utilizationDistribution: utilizationRanges,
      efficiencyTrends,
      vehicleEfficiency,
      vehicleRanking,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching mileage metrics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
