import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // Optional filter by location type

    const query = supabase.from("locations").select("*").eq("is_active", true)

    if (type) {
      // Note: location_type column doesn't exist in current schema, but keeping for future enhancement
      // query = query.eq("location_type", type)
    }

    const { data: locations, error } = await query.order("name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching locations:", error)
      return NextResponse.json({ error: "Failed to fetch locations", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: locations, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in locations API:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: location, error } = await supabase.from("locations").insert(body).select("*").single()

    if (error) {
      console.error("[v0] Error creating location:", error)
      return NextResponse.json({ error: "Failed to create location", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: location, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error creating location:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
