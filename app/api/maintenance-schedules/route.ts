import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const vehicleId = searchParams.get("vehicle_id")
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")

    let query = supabase
      .from("maintenance_schedules")
      .select(`
        *,
        vehicle:vehicles(id, license_plate, internal_number)
      `)
      .order("scheduled_date", { ascending: true })

    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: maintenanceSchedules, error } = await query

    if (error) {
      console.error("[v0] Error fetching maintenance schedules:", error)
      return NextResponse.json({ error: "Failed to fetch maintenance schedules", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: maintenanceSchedules, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in maintenance schedules API:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: maintenanceSchedule, error } = await supabase
      .from("maintenance_schedules")
      .insert(body)
      .select(`
        *,
        vehicle:vehicles(id, license_plate, internal_number)
      `)
      .single()

    if (error) {
      console.error("[v0] Error creating maintenance schedule:", error)
      return NextResponse.json({ error: "Failed to create maintenance schedule", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: maintenanceSchedule, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error creating maintenance schedule:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
