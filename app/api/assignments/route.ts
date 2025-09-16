import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const assignments = await db.getAssignmentTypes()

    return NextResponse.json({ data: assignments, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assignments", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const assignment = await db.createAssignmentType(body)

    return NextResponse.json({ data: assignment, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create assignment", success: false }, { status: 500 })
  }
}
