import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Fetching assignment with ID:", params.id)
    const assignment = await db.getAssignmentType(params.id)

    if (!assignment) {
      console.log("[v0] Assignment not found:", params.id)
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    console.log("[v0] Found assignment:", assignment)
    return NextResponse.json({ assignment })
  } catch (error) {
    console.error("[v0] Error fetching assignment:", error)
    return NextResponse.json({ error: "Failed to fetch assignment", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("[v0] Updating assignment:", params.id, "with data:", body)

    const updatedAssignment = await db.updateAssignmentType(params.id, body)
    console.log("[v0] Updated assignment:", updatedAssignment)

    return NextResponse.json({ assignment: updatedAssignment, success: true })
  } catch (error) {
    console.error("[v0] Error updating assignment:", error)
    return NextResponse.json({ error: "Failed to update assignment", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting assignment:", params.id)
    await db.deleteAssignmentType(params.id)
    console.log("[v0] Assignment deleted successfully:", params.id)

    return NextResponse.json({ message: "Assignment deleted successfully", success: true })
  } catch (error) {
    console.error("[v0] Error deleting assignment:", error)
    return NextResponse.json({ error: "Failed to delete assignment", details: error.message }, { status: 500 })
  }
}
