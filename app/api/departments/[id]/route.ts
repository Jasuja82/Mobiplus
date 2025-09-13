import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Fetching department with ID:", params.id)
    const department = await db.getDepartment(params.id)

    if (!department) {
      console.log("[v0] Department not found:", params.id)
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    console.log("[v0] Found department:", department)
    return NextResponse.json({ department })
  } catch (error) {
    console.error("[v0] Error fetching department:", error)
    return NextResponse.json({ error: "Failed to fetch department", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("[v0] Updating department:", params.id, "with data:", body)

    const updatedDepartment = await db.updateDepartment(params.id, body)
    console.log("[v0] Updated department:", updatedDepartment)

    return NextResponse.json({ department: updatedDepartment, success: true })
  } catch (error) {
    console.error("[v0] Error updating department:", error)
    return NextResponse.json({ error: "Failed to update department", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting department:", params.id)
    await db.deleteDepartment(params.id)
    console.log("[v0] Department deleted successfully:", params.id)

    return NextResponse.json({ message: "Department deleted successfully", success: true })
  } catch (error) {
    console.error("[v0] Error deleting department:", error)
    return NextResponse.json({ error: "Failed to delete department", details: error.message }, { status: 500 })
  }
}
