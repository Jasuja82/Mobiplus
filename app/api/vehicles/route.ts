import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("department_id")

    const vehicles = await db.getVehicles(departmentId || undefined)

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const vehicle = await db.createVehicle(body)

    return NextResponse.json({ vehicle }, { status: 201 })
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json({ error: "Failed to create vehicle", details: error.message }, { status: 500 })
  }
}
