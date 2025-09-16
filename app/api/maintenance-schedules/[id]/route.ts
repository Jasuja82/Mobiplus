import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: maintenanceSchedule, error } = await supabase
      .from("maintenance_schedules")
      .select(`
        *,
        vehicle:vehicles(id, license_plate, internal_number)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("[v0] Error fetching maintenance schedule:", error)
      return NextResponse.json({ error: "Maintenance schedule not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ data: maintenanceSchedule, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error fetching maintenance schedule:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: maintenanceSchedule, error } = await supabase
      .from("maintenance_schedules")
      .update(body)
      .eq("id", params.id)
      .select(`
        *,
        vehicle:vehicles(id, license_plate, internal_number)
      `)
      .single()

    if (error) {
      console.error("[v0] Error updating maintenance schedule:", error)
      return NextResponse.json({ error: "Failed to update maintenance schedule", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: maintenanceSchedule, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error updating maintenance schedule:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("maintenance_schedules").delete().eq("id", params.id)

    if (error) {
      console.error("[v0] Error deleting maintenance schedule:", error)
      return NextResponse.json({ error: "Failed to delete maintenance schedule", success: false }, { status: 500 })
    }

    return NextResponse.json({ message: "Maintenance schedule deleted successfully", success: true })
  } catch (error) {
    console.error("[v0] Unexpected error deleting maintenance schedule:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
