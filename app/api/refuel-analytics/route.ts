import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const vehicleId = searchParams.get("vehicle_id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = searchParams.get("limit")
    const flaggedOnly = searchParams.get("flagged_only") === "true"

    let query = supabase.from("refuel_analytics").select("*").order("data", { ascending: false })

    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId)
    }

    if (startDate) {
      query = query.gte("data", startDate)
    }

    if (endDate) {
      query = query.lte("data", endDate)
    }

    if (flaggedOnly) {
      query = query.or(
        "has_negative_mileage.eq.true,has_high_mileage_jump.eq.true,has_high_fuel_volume.eq.true,has_unusual_fuel_price.eq.true",
      )
    }

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: refuelAnalytics, error } = await query

    if (error) {
      console.error("[v0] Error fetching refuel analytics:", error)
      return NextResponse.json({ error: "Failed to fetch refuel analytics", success: false }, { status: 500 })
    }

    // Calculate summary statistics
    const totalRecords = refuelAnalytics?.length || 0
    const flaggedRecords =
      refuelAnalytics?.filter(
        (r) => r.has_negative_mileage || r.has_high_mileage_jump || r.has_high_fuel_volume || r.has_unusual_fuel_price,
      ).length || 0

    const summary = {
      totalRecords,
      flaggedRecords,
      flaggedPercentage: totalRecords > 0 ? Math.round((flaggedRecords / totalRecords) * 100) : 0,
      averageFuelEfficiency:
        refuelAnalytics
          ?.filter((r) => r.fuel_efficiency_l_per_100km)
          .reduce((sum, r, _, arr) => sum + (r.fuel_efficiency_l_per_100km || 0) / arr.length, 0) || 0,
      averageKmPerLiter:
        refuelAnalytics
          ?.filter((r) => r.km_per_liter)
          .reduce((sum, r, _, arr) => sum + (r.km_per_liter || 0) / arr.length, 0) || 0,
    }

    return NextResponse.json({
      data: refuelAnalytics,
      summary,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Unexpected error in refuel analytics API:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
