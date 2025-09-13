import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Fetching assignment types")
    const assignments = await db.getAssignmentTypes()
    console.log("[v0] Found assignments:", assignments?.length || 0)

    return NextResponse.json({ data: assignments, success: true })
  } catch (error) {
    console.error("[v0] Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Creating assignment with data:", body)

    const assignment = await db.createAssignmentType(body)
    console.log("[v0] Created assignment:", assignment)

    return NextResponse.json({ data: assignment, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment", success: false }, { status: 500 })
  }
}
