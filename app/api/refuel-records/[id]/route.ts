import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const record = await db.getRefuelRecord(params.id)
    if (!record) {
      return NextResponse.json({ error: "Refuel record not found" }, { status: 404 })
    }
    return NextResponse.json({ record })
  } catch (error) {
    console.error("[v0] Error fetching refuel record:", error)
    return NextResponse.json({ error: "Failed to fetch refuel record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("[v0] Updating refuel record:", params.id, body)

    const record = await db.updateRefuelRecord(params.id, body)
    if (!record) {
      return NextResponse.json({ error: "Refuel record not found" }, { status: 404 })
    }

    console.log("[v0] Updated refuel record:", record)
    return NextResponse.json({ record })
  } catch (error) {
    console.error("[v0] Error updating refuel record:", error)
    return NextResponse.json({ error: "Failed to update refuel record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting refuel record:", params.id)

    const success = await db.deleteRefuelRecord(params.id)
    if (!success) {
      return NextResponse.json({ error: "Refuel record not found" }, { status: 404 })
    }

    console.log("[v0] Deleted refuel record:", params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting refuel record:", error)
    return NextResponse.json({ error: "Failed to delete refuel record" }, { status: 500 })
  }
}
