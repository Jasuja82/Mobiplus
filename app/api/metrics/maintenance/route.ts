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

    // Fetch maintenance data
    const { data: maintenanceData } = await supabase
      .from("maintenance_interventions")
      .select(`
        *,
        vehicles(license_plate, make, model)
      `)
      .gte("intervention_date", dateFrom.toISOString())
      .lte("intervention_date", dateTo.toISOString())

    // Calculate metrics
    const totalCost = maintenanceData?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0
    const totalInterventions = maintenanceData?.length || 0
    const averageCost = totalInterventions > 0 ? totalCost / totalInterventions : 0

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
      totalCost,
      totalInterventions,
      averageCost,
      averageDuration: 4.5,
      costChange: 12.5,
      interventionsChange: 8.3,
      monthlyTrends: [
        { month: "Jan", cost: 2500, interventions: 12 },
        { month: "Fev", cost: 3200, interventions: 15 },
        { month: "Mar", cost: 2800, interventions: 13 },
        { month: "Abr", cost: 3500, interventions: 18 },
        { month: "Mai", cost: 2900, interventions: 14 },
        { month: "Jun", cost: 3100, interventions: 16 },
      ],
      maintenanceTypes: [
        { name: "Preventiva", value: 45, cost: 15000 },
        { name: "Corretiva", value: 30, cost: 12000 },
        { name: "Preditiva", value: 15, cost: 8000 },
        { name: "Emergência", value: 10, cost: 5000 },
      ],
      vehicleRanking: [
        { vehicle: "AA-00-AA", cost: 4500 },
        { vehicle: "BB-11-BB", cost: 3200 },
        { vehicle: "CC-22-CC", cost: 2800 },
      ],
      upcomingMaintenance: [
        { vehicle: "AA-00-AA", type: "Revisão", date: "2024-01-15", estimatedCost: 350 },
        { vehicle: "BB-11-BB", type: "Pneus", date: "2024-01-20", estimatedCost: 280 },
      ],
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching maintenance metrics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
