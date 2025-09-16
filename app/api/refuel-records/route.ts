import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    let query = supabase
      .from("refuel_analytics") // Use the compatibility view
      .select("*")
      .order("refuel_date", { ascending: false })

    // Apply filters using the view's column names for backward compatibility
    const vehicleId = searchParams.get("vehicle_id")
    const driverId = searchParams.get("driver_id")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const limit = searchParams.get("limit")

    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId)
    }
    if (driverId) {
      query = query.eq("driver_id", driverId)
    }
    if (dateFrom) {
      query = query.gte("refuel_date", dateFrom)
    }
    if (dateTo) {
      query = query.lte("refuel_date", dateTo)
    }
    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: records, error } = await query

    if (error) {
      console.error("[v0] Error fetching refuel records:", error)
      return NextResponse.json({ error: "Failed to fetch refuel records", details: error.message }, { status: 500 })
    }

    console.log("[v0] Found refuel records:", records?.length || 0)
    return NextResponse.json({ records })
  } catch (error) {
    console.error("[v0] Error fetching refuel records:", error)
    return NextResponse.json({ error: "Failed to fetch refuel records", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    console.log("[v0] Creating refuel record:", body)

    const refuelData = {
      viatura: body.vehicle_id,
      driver: body.driver_id,
      afectacao: body.assignment_id || null,
      local: body.location_id || body.fuel_station_id || null,
      data: body.refuel_date
        ? new Date(body.refuel_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      odometer: body.odometer_reading?.toString() || body.odometer,
      liters: Number.parseFloat(body.liters),
      literCost: Number.parseFloat(body.cost_per_liter || body.literCost),
      notes: body.notes || null,
    }

    if (Array.isArray(body.records)) {
      // Bulk import - map each record
      const mappedRecords = body.records.map((record) => ({
        viatura: record.viatura || record.vehicle_id,
        driver: record.driver || record.driver_id,
        afectacao: record.afectacao || record.assignment_id,
        local: record.local || record.location_id,
        data:
          record.data ||
          (record.refuel_date
            ? new Date(record.refuel_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]),
        odometer: record.odometer?.toString(),
        liters: Number.parseFloat(record.liters),
        literCost: Number.parseFloat(record.literCost || record.cost_per_liter),
        notes: record.notes || null,
      }))

      const { data: records, error } = await supabase.from("refuel_records").insert(mappedRecords).select()

      if (error) {
        throw error
      }

      console.log("[v0] Created bulk refuel records:", records?.length || 0)
      return NextResponse.json({ records, count: records.length }, { status: 201 })
    } else {
      // Single record
      const { data: record, error } = await supabase.from("refuel_records").insert(refuelData).select().single()

      if (error) {
        throw error
      }

      console.log("[v0] Created refuel record:", record)
      return NextResponse.json({ record }, { status: 201 })
    }
  } catch (error) {
    console.error("[v0] Error creating refuel record:", error)
    return NextResponse.json({ error: "Failed to create refuel record", details: error.message }, { status: 500 })
  }
}
