import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: departments, error } = await supabase
      .from("departments")
      .select(`
        *,
        manager:users(name, email)
      `)
      .order("name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching departments:", error)
      return NextResponse.json({ error: "Failed to fetch departments", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: departments, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in departments API:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: department, error } = await supabase
      .from("departments")
      .insert(body)
      .select(`
        *,
        manager:users(name, email)
      `)
      .single()

    if (error) {
      console.error("[v0] Error creating department:", error)
      return NextResponse.json({ error: "Failed to create department", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: department, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error creating department:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
