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

    // Fetch fuel data
    const { data: fuelData } = await supabase
      .from("refuel_records")
      .select(`
        *,
        vehicles(license_plate, make, model)
      `)
      .gte("refuel_date", dateFrom.toISOString())
      .lte("refuel_date", dateTo.toISOString())

    // Calculate metrics
    const totalCost = fuelData?.reduce((sum, r) => sum + r.total_cost, 0) || 0
    const totalLiters = fuelData?.reduce((sum, r) => sum + r.liters, 0) || 0
    const averagePrice = totalLiters > 0 ? totalCost / totalLiters : 0
    const totalRefuels = fuelData?.length || 0

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
      totalLiters,
      averagePrice,
      averageConsumption: 8.5,
      totalRefuels,
      costChange: 15.2,
      litersChange: 12.8,
      refuelsChange: 5.4,
      monthlyTrends: [
        { month: "Jan", cost: 4500, liters: 2800 },
        { month: "Fev", cost: 5200, liters: 3200 },
        { month: "Mar", cost: 4800, liters: 2950 },
        { month: "Abr", cost: 5500, liters: 3400 },
        { month: "Mai", cost: 4900, liters: 3000 },
        { month: "Jun", cost: 5100, liters: 3150 },
      ],
      priceHistory: [
        { date: "2024-01", price: 1.45 },
        { date: "2024-02", price: 1.48 },
        { date: "2024-03", price: 1.52 },
        { date: "2024-04", price: 1.49 },
        { date: "2024-05", price: 1.51 },
        { date: "2024-06", price: 1.47 },
      ],
      vehicleEfficiency: [
        { vehicle: "AA-00-AA", consumption: 7.8 },
        { vehicle: "BB-11-BB", consumption: 9.2 },
        { vehicle: "CC-22-CC", consumption: 8.5 },
      ],
      stationCosts: [
        { station: "Galp Ponta Delgada", cost: 12500 },
        { station: "BP Angra", cost: 8900 },
        { station: "Repsol Lagoa", cost: 6700 },
      ],
      stationPrices: [
        { station: "Galp Ponta Delgada", averagePrice: 1.48 },
        { station: "BP Angra", averagePrice: 1.52 },
        { station: "Repsol Lagoa", averagePrice: 1.45 },
      ],
      vehicleRanking: [
        { vehicle: "AA-00-AA", cost: 5500 },
        { vehicle: "BB-11-BB", cost: 4200 },
        { vehicle: "CC-22-CC", cost: 3800 },
      ],
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching fuel metrics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
