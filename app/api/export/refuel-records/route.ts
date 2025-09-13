import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const vehicleId = searchParams.get("vehicle_id")
    const driverId = searchParams.get("driver_id")

    const supabase = await createClient()

    // Build query with filters
    let query = supabase
      .from("refuel_records")
      .select(`
        *,
        vehicle:vehicles(license_plate, make, model),
        driver:drivers(
          license_number,
          user:users(name)
        )
      `)
      .order("refuel_date", { ascending: false })

    if (dateFrom) {
      query = query.gte("refuel_date", dateFrom)
    }
    if (dateTo) {
      query = query.lte("refuel_date", dateTo)
    }
    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId)
    }
    if (driverId) {
      query = query.eq("driver_id", driverId)
    }

    const { data: records, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }

    const csvContent = [
      // Header row with Portuguese labels
      [
        "Data",
        "Matrícula",
        "Veículo",
        "Condutor",
        "Quilometragem (km)",
        "Litros",
        "Preço por Litro (€)",
        "Custo Total (€)",
        "Posto de Combustível",
        "Número do Recibo",
        "Observações",
        "Eficiência (km/L)",
        "Custo por km (€)",
      ].join(","),
      // Data rows
      ...records.map((record) => {
        const efficiency = record.mileage && record.liters ? (record.mileage / record.liters).toFixed(2) : "N/A"
        const costPerKm =
          record.mileage && record.total_cost ? ((record.total_cost / record.mileage) * 100).toFixed(4) : "N/A"

        return [
          formatDate(record.refuel_date),
          `"${record.vehicle?.license_plate || "N/A"}"`,
          `"${record.vehicle?.make || ""} ${record.vehicle?.model || ""}"`.trim(),
          `"${record.driver?.user?.name || record.driver?.license_number || "N/A"}"`,
          record.mileage || 0,
          record.liters?.toFixed(2) || 0,
          record.cost_per_liter?.toFixed(3) || 0,
          record.total_cost?.toFixed(2) || 0,
          `"${record.fuel_station || "N/A"}"`,
          `"${record.receipt_number || "N/A"}"`,
          `"${(record.notes || "").replace(/"/g, '""')}"`, // Escape quotes
          efficiency,
          costPerKm,
        ].join(",")
      }),
    ].join("\n")

    const bom = "\uFEFF"
    const csvWithBom = bom + csvContent

    const filename = `abastecimentos_${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("[v0] Error exporting refuel records:", error)
    return NextResponse.json({ error: "Failed to export refuel records" }, { status: 500 })
  }
}
