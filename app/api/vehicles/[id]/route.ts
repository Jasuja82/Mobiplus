import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Fetching vehicle with ID:", params.id)
    const vehicle = await db.getVehicle(params.id)

    if (!vehicle) {
      console.log("[v0] Vehicle not found:", params.id)
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    console.log("[v0] Found vehicle:", vehicle)
    return NextResponse.json({ vehicle })
  } catch (error) {
    console.error("[v0] Error fetching vehicle:", error)
    return NextResponse.json({ error: "Failed to fetch vehicle", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("[v0] Updating vehicle:", params.id, "with data:", body)

    const updatedVehicle = await db.updateVehicle(params.id, body)
    console.log("[v0] Updated vehicle:", updatedVehicle)

    return NextResponse.json({ vehicle: updatedVehicle })
  } catch (error) {
    console.error("[v0] Error updating vehicle:", error)
    return NextResponse.json({ error: "Failed to update vehicle", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting vehicle:", params.id)
    await db.deleteVehicle(params.id)
    console.log("[v0] Vehicle deleted successfully:", params.id)

    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting vehicle:", error)
    return NextResponse.json({ error: "Failed to delete vehicle", details: error.message }, { status: 500 })
  }
}
