import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: driver, error } = await supabase
      .from("drivers")
      .select(`
        *,
        user:users(name, email, phone),
        department:departments(name)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("[v0] Error fetching driver:", error)
      return NextResponse.json({ error: "Driver not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ data: driver, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error fetching driver:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: driver, error } = await supabase
      .from("drivers")
      .update(body)
      .eq("id", params.id)
      .select(`
        *,
        user:users(name, email, phone),
        department:departments(name)
      `)
      .single()

    if (error) {
      console.error("[v0] Error updating driver:", error)
      return NextResponse.json({ error: "Failed to update driver", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: driver, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error updating driver:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("drivers").delete().eq("id", params.id)

    if (error) {
      console.error("[v0] Error deleting driver:", error)
      return NextResponse.json({ error: "Failed to delete driver", success: false }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unexpected error deleting driver:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
