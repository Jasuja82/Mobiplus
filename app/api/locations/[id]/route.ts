import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Fetching location with ID:", params.id)
    const location = await db.getLocation(params.id)

    if (!location) {
      console.log("[v0] Location not found:", params.id)
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    console.log("[v0] Found location:", location)
    return NextResponse.json({ location })
  } catch (error) {
    console.error("[v0] Error fetching location:", error)
    return NextResponse.json({ error: "Failed to fetch location", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("[v0] Updating location:", params.id, "with data:", body)

    const updatedLocation = await db.updateLocation(params.id, body)
    console.log("[v0] Updated location:", updatedLocation)

    return NextResponse.json({ location: updatedLocation, success: true })
  } catch (error) {
    console.error("[v0] Error updating location:", error)
    return NextResponse.json({ error: "Failed to update location", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting location:", params.id)
    await db.deleteLocation(params.id)
    console.log("[v0] Location deleted successfully:", params.id)

    return NextResponse.json({ message: "Location deleted successfully", success: true })
  } catch (error) {
    console.error("[v0] Error deleting location:", error)
    return NextResponse.json({ error: "Failed to delete location", details: error.message }, { status: 500 })
  }
}
