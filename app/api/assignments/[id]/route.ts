import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assignment = await db.getAssignmentType(params.id)

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json({ error: "Failed to fetch assignment", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const updatedAssignment = await db.updateAssignmentType(params.id, body)

    return NextResponse.json({ assignment: updatedAssignment, success: true })
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json({ error: "Failed to update assignment", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.deleteAssignmentType(params.id)

    return NextResponse.json({ message: "Assignment deleted successfully", success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json({ error: "Failed to delete assignment", details: error.message }, { status: 500 })
  }
}
