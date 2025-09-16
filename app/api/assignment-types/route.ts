import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: assignmentTypes, error } = await supabase
      .from("assignment_types")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching assignment types:", error)
      return NextResponse.json({ error: "Failed to fetch assignment types", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: assignmentTypes, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in assignment types API:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: assignmentType, error } = await supabase.from("assignment_types").insert(body).select("*").single()

    if (error) {
      console.error("[v0] Error creating assignment type:", error)
      return NextResponse.json({ error: "Failed to create assignment type", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: assignmentType, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error creating assignment type:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
