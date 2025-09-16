import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: record, error } = await supabase.from("refuel_analytics").select("*").eq("id", params.id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Refuel record not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ record })
  } catch (error) {
    console.error("[v0] Error fetching refuel record:", error)
    return NextResponse.json({ error: "Failed to fetch refuel record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    console.log("[v0] Updating refuel record:", params.id, body)

    const refuelData = {
      viatura: body.vehicle_id || body.viatura,
      driver: body.driver_id || body.driver,
      afectacao: body.assignment_id || body.afectacao,
      local: body.location_id || body.fuel_station_id || body.local,
      data: body.refuel_date ? new Date(body.refuel_date).toISOString().split("T")[0] : body.data,
      odometer: body.odometer_reading?.toString() || body.odometer,
      liters: Number.parseFloat(body.liters),
      literCost: Number.parseFloat(body.cost_per_liter || body.literCost),
      notes: body.notes || null,
    }

    const { data: record, error } = await supabase
      .from("refuel_records")
      .update(refuelData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Refuel record not found" }, { status: 404 })
      }
      throw error
    }

    console.log("[v0] Updated refuel record:", record)
    return NextResponse.json({ record })
  } catch (error) {
    console.error("[v0] Error updating refuel record:", error)
    return NextResponse.json({ error: "Failed to update refuel record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    console.log("[v0] Deleting refuel record:", params.id)

    const { error } = await supabase.from("refuel_records").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    console.log("[v0] Deleted refuel record:", params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting refuel record:", error)
    return NextResponse.json({ error: "Failed to delete refuel record" }, { status: 500 })
  }
}
