import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Extract filter parameters
    const timePeriod = searchParams.get("timePeriod") || "month"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Calculate date range
    const now = new Date()
    let dateFrom: Date
    let dateTo = new Date()

    if (startDate && endDate) {
      dateFrom = new Date(startDate)
      dateTo = new Date(endDate)
    } else {
      switch (timePeriod) {
        case "quarter":
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          break
        case "semester":
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 6, 1)
          break
        case "year":
          dateFrom = new Date(now.getFullYear() - 1, now.getMonth(), 1)
          break
        default:
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      }
    }

    // Mock data for demonstration
    const mockData = {
      locations: [
        { id: "1", name: "São Miguel" },
        { id: "2", name: "Terceira" },
      ],
      departments: [
        { id: "1", name: "Operações" },
        { id: "2", name: "Administração" },
      ],
      vehicles: [
        { id: "1", license_plate: "AA-00-AA" },
        { id: "2", license_plate: "BB-11-BB" },
      ],
      assignments: [
        { id: "operational", name: "Operacional" },
        { id: "administrative", name: "Administrativo" },
      ],
      totalKilometers: 125000,
      averageDaily: 285,
      utilizationRate: 78.5,
      efficiency: 12.8,
      totalTrips: 1250,
      kilometersChange: 8.7,
      tripsChange: 12.3,
      monthlyTrends: [
        { month: "Jan", kilometers: 18500, trips: 185 },
        { month: "Fev", kilometers: 22000, trips: 220 },
        { month: "Mar", kilometers: 19800, trips: 198 },
        { month: "Abr", kilometers: 24500, trips: 245 },
        { month: "Mai", kilometers: 21200, trips: 212 },
        { month: "Jun", kilometers: 23000, trips: 230 },
      ],
      vehicleUtilization: [
        { vehicle: "AA-00-AA", utilization: 85 },
        { vehicle: "BB-11-BB", utilization: 72 },
        { vehicle: "CC-22-CC", utilization: 68 },
        { vehicle: "DD-33-DD", utilization: 91 },
      ],
      utilizationDistribution: [
        { range: "0-25%", vehicles: 2 },
        { range: "26-50%", vehicles: 5 },
        { range: "51-75%", vehicles: 8 },
        { range: "76-100%", vehicles: 12 },
      ],
      efficiencyTrends: [
        { month: "Jan", efficiency: 12.2 },
        { month: "Fev", efficiency: 12.8 },
        { month: "Mar", efficiency: 12.5 },
        { month: "Abr", efficiency: 13.1 },
        { month: "Mai", efficiency: 12.9 },
        { month: "Jun", efficiency: 13.0 },
      ],
      vehicleEfficiency: [
        { vehicle: "AA-00-AA", efficiency: 13.5 },
        { vehicle: "BB-11-BB", efficiency: 11.8 },
        { vehicle: "CC-22-CC", efficiency: 12.2 },
        { vehicle: "DD-33-DD", efficiency: 14.1 },
      ],
      vehicleRanking: [
        { vehicle: "AA-00-AA", kilometers: 35000 },
        { vehicle: "BB-11-BB", kilometers: 28500 },
        { vehicle: "CC-22-CC", kilometers: 22000 },
        { vehicle: "DD-33-DD", kilometers: 39500 },
      ],
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching mileage metrics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
