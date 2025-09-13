import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      vehicleId: searchParams.get("vehicle_id") || undefined,
      driverId: searchParams.get("driver_id") || undefined,
      departmentId: searchParams.get("department_id") || undefined,
      dateFrom: searchParams.get("date_from") || undefined,
      dateTo: searchParams.get("date_to") || undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined,
    }

    console.log("[v0] Fetching refuel records with filters:", filters)
    const records = await db.getRefuelRecords(filters)
    console.log("[v0] Found refuel records:", records?.length || 0)

    return NextResponse.json({ records })
  } catch (error) {
    console.error("[v0] Error fetching refuel records:", error)
    return NextResponse.json({ error: "Failed to fetch refuel records", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Creating refuel record(s):", body)

    if (Array.isArray(body.records)) {
      // Bulk import
      const records = await db.bulkCreateRefuelRecords(body.records)
      console.log("[v0] Created bulk refuel records:", records?.length || 0)
      return NextResponse.json({ records, count: records.length }, { status: 201 })
    } else {
      // Single record
      const record = await db.createRefuelRecord(body)
      console.log("[v0] Created refuel record:", record)
      return NextResponse.json({ record }, { status: 201 })
    }
  } catch (error) {
    console.error("[v0] Error creating refuel record:", error)
    return NextResponse.json({ error: "Failed to create refuel record", details: error.message }, { status: 500 })
  }
}
