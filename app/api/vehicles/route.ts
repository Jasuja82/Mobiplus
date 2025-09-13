import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("department_id")

    console.log("[v0] Fetching vehicles with departmentId:", departmentId)
    const vehicles = await db.getVehicles(departmentId || undefined)
    console.log("[v0] Found vehicles:", vehicles?.length || 0)

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error("[v0] Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Creating vehicle with data:", body)

    const vehicle = await db.createVehicle(body)
    console.log("[v0] Created vehicle:", vehicle)

    return NextResponse.json({ vehicle }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating vehicle:", error)
    return NextResponse.json({ error: "Failed to create vehicle", details: error.message }, { status: 500 })
  }
}
