async function mapCsvToTables() {
  try {
    console.log("[v0] Fetching CSV data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )
    const csvText = await response.text()

    console.log("[v0] Parsing CSV...")
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    console.log("[v0] Headers found:", headers)

    // Parse the example record you provided
    const exampleRecord = lines[1].split(",").map((v) => v.trim())

    console.log("[v0] Example record mapping:")

    // Create field mapping based on your explanation
    const fieldMapping = {
      vehicle_number: exampleRecord[0], // 40
      "vehicle.license_plate": exampleRecord[1], // 09-26-VT
      fueling_date: exampleRecord[2], // 02/05/2025
      location_name: exampleRecord[3], // Angra
      location_number: exampleRecord[4], // 1
      driver_name: exampleRecord[5], // Antonio Rodrigues Cardoso
      "assignment.name": exampleRecord[6], // Interurbana
      odometer: exampleRecord[7], // 727556
      odometer_difference: exampleRecord[8], // 89.00
      liter_cost: exampleRecord[9], // 1.430
      total_cost: exampleRecord[10], // 127.27
      notes: exampleRecord[11], // kms estimados, odometro avariado
    }

    console.log("[v0] Field mapping:")
    Object.entries(fieldMapping).forEach(([field, value]) => {
      console.log(`  ${field}: ${value}`)
    })

    // Categorize fields by table
    const tableData = {
      vehicles: {
        vehicle_number: fieldMapping.vehicle_number,
        license_plate: fieldMapping["vehicle.license_plate"],
        current_odometer: fieldMapping.odometer,
      },
      locations: {
        name: fieldMapping.location_name,
        internal_number: fieldMapping.location_number,
      },
      drivers: {
        name: fieldMapping.driver_name,
      },
      assignments: {
        name: fieldMapping["assignment.name"],
      },
      refuel_records: {
        fueling_date: fieldMapping.fueling_date,
        odometer_reading: fieldMapping.odometer,
        odometer_difference: fieldMapping.odometer_difference,
        liter_cost: fieldMapping.liter_cost,
        total_cost: fieldMapping.total_cost,
        notes: fieldMapping.notes,
      },
    }

    console.log("[v0] Data categorized by tables:")
    Object.entries(tableData).forEach(([table, data]) => {
      console.log(`\n${table.toUpperCase()}:`)
      Object.entries(data).forEach(([field, value]) => {
        console.log(`  ${field}: ${value}`)
      })
    })

    // Calculate derived values
    const liters = Number.parseFloat(fieldMapping.total_cost) / Number.parseFloat(fieldMapping.liter_cost)
    const kmPerLiter = Number.parseFloat(fieldMapping.odometer_difference) / liters
    const costPerKm = Number.parseFloat(fieldMapping.total_cost) / Number.parseFloat(fieldMapping.odometer_difference)
    const litersPer100km = (liters / Number.parseFloat(fieldMapping.odometer_difference)) * 100

    console.log("[v0] Calculated metrics:")
    console.log(`  Liters: ${liters.toFixed(2)}`)
    console.log(`  KM per Liter: ${kmPerLiter.toFixed(2)}`)
    console.log(`  Cost per KM: €${costPerKm.toFixed(3)}`)
    console.log(`  Liters per 100km: ${litersPer100km.toFixed(2)}`)

    console.log("[v0] CSV mapping completed successfully!")
  } catch (error) {
    console.error("[v0] Error mapping CSV:", error)
  }
}

mapCsvToTables()
