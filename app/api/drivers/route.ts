import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: drivers, error } = await supabase
      .from("drivers")
      .select(`
        *,
        user:users(name, email, phone),
        department:departments(name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching drivers:", error)
      return NextResponse.json({ error: "Failed to fetch drivers", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: drivers, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in drivers API:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: driver, error } = await supabase
      .from("drivers")
      .insert(body)
      .select(`
        *,
        user:users(name, email, phone),
        department:departments(name)
      `)
      .single()

    if (error) {
      console.error("[v0] Error creating driver:", error)
      return NextResponse.json({ error: "Failed to create driver", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: driver, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error creating driver:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
