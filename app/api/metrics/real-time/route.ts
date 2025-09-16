import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const [vehiclesResult, maintenanceResult, fuelResult] = await Promise.all([
      supabase.from("vehicles").select("status").in("status", ["active", "maintenance", "inactive"]),

      supabase
        .from("maintenance_schedules")
        .select("id")
        .eq("status", "scheduled")
        .lte("scheduled_date", new Date().toISOString()),

      supabase
        .from("refuel_records")
        .select("cost_per_liter, liters, odometer_reading")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .limit(1000),
    ])

    // Calculate metrics
    const vehicles = vehiclesResult.data || []
    const totalVehicles = vehicles.length
    const activeVehicles = vehicles.filter((v) => v.status === "active").length
    const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length
    const pendingMaintenance = maintenanceResult.data?.length || 0

    // Calculate fuel metrics
    const fuelRecords = fuelResult.data || []
    const monthlyFuelCost = fuelRecords.reduce((sum, record) => sum + record.cost_per_liter * record.liters, 0)
    const avgFuelEfficiency =
      fuelRecords.length > 0
        ? (fuelRecords.reduce((sum, record) => sum + record.liters / 100, 0) / fuelRecords.length) * 100
        : 0

    // Mock trends (in production, calculate from historical data)
    const trends = {
      fuelEfficiencyTrend: (Math.random() - 0.5) * 10,
      costTrend: (Math.random() - 0.5) * 15,
      maintenanceTrend: (Math.random() - 0.5) * 20,
    }

    return NextResponse.json({
      metrics: {
        totalVehicles,
        activeVehicles,
        maintenanceVehicles,
        avgFuelEfficiency,
        pendingMaintenance,
        monthlyFuelCost,
        monthlyMaintenanceCost: 2300, // Mock value
      },
      trends,
    })
  } catch (error) {
    console.error("Error fetching real-time metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
