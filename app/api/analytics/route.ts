import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      departmentId: searchParams.get("department_id") || undefined,
      dateFrom: searchParams.get("date_from") || undefined,
      dateTo: searchParams.get("date_to") || undefined,
    }

    const analytics = await db.getFleetAnalytics(filters)

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics", details: error.message }, { status: 500 })
  }
}
