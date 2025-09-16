import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: assignmentType, error } = await supabase
      .from("assignment_types")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("[v0] Error fetching assignment type:", error)
      return NextResponse.json({ error: "Assignment type not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ data: assignmentType, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error fetching assignment type:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: assignmentType, error } = await supabase
      .from("assignment_types")
      .update(body)
      .eq("id", params.id)
      .select("*")
      .single()

    if (error) {
      console.error("[v0] Error updating assignment type:", error)
      return NextResponse.json({ error: "Failed to update assignment type", success: false }, { status: 500 })
    }

    return NextResponse.json({ data: assignmentType, success: true })
  } catch (error) {
    console.error("[v0] Unexpected error updating assignment type:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("assignment_types").delete().eq("id", params.id)

    if (error) {
      console.error("[v0] Error deleting assignment type:", error)
      return NextResponse.json({ error: "Failed to delete assignment type", success: false }, { status: 500 })
    }

    return NextResponse.json({ message: "Assignment type deleted successfully", success: true })
  } catch (error) {
    console.error("[v0] Unexpected error deleting assignment type:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
