async function parseTestBatch() {
  try {
    console.log("[v0] Fetching test batch CSV...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv",
    )
    const csvText = await response.text()

    console.log("[v0] Raw CSV content (first 500 chars):")
    console.log(csvText.substring(0, 500))

    // Split into lines and parse
    const lines = csvText.trim().split("\n")
    console.log(`[v0] Total lines: ${lines.length}`)

    // Parse headers
    const headers = lines[0].split(";").map((h) => h.trim())
    console.log("[v0] Headers:", headers)

    // Parse data rows
    const records = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(";").map((v) => v.trim())

      // Create record object
      const record = {}
      headers.forEach((header, index) => {
        let value = values[index] || ""

        // Handle empty odometer_difference - set to 0
        if (header === "calculated_odometer_diference" && (value === "" || value === null || value === undefined)) {
          value = "0"
        }

        record[header] = value
      })

      records.push(record)
    }

    console.log(`[v0] Parsed ${records.length} records`)

    // Show first few records with proper odometer handling
    console.log("[v0] First 3 records with odometer difference handling:")
    records.slice(0, 3).forEach((record, index) => {
      console.log(`Record ${index + 1}:`)
      console.log(`  Vehicle: ${record["vehicle.internal_number"]} (${record["vehicle.plate"]})`)
      console.log(`  Driver: ${record["driver.name"]}`)
      console.log(`  Location: ${record["location.name"]}`)
      console.log(`  Date: ${record["date"]}`)
      console.log(`  Odometer: ${record["odometer"]}`)
      console.log(`  Odometer Difference: ${record["calculated_odometer_diference"]} (handled empty as 0)`)
      console.log(`  Liters: ${record["liters"]}`)
      console.log(`  Total Cost: ${record["total_cost"]}`)
      console.log("---")
    })

    // Check for empty odometer differences
    const emptyOdometerCount = records.filter(
      (r) => r["calculated_odometer_diference"] === "0" || r["calculated_odometer_diference"] === "",
    ).length

    console.log(`[v0] Records with empty/zero odometer difference: ${emptyOdometerCount}`)

    // Analyze unique values
    const uniqueVehicles = [...new Set(records.map((r) => r["vehicle.internal_number"]))]
    const uniqueDrivers = [...new Set(records.map((r) => r["driver.name"]))]
    const uniqueLocations = [...new Set(records.map((r) => r["location.name"]))]
    const uniqueDepartments = [...new Set(records.map((r) => r["department.name"]))]

    console.log("[v0] Data Summary:")
    console.log(`  Unique Vehicles: ${uniqueVehicles.length}`)
    console.log(`  Unique Drivers: ${uniqueDrivers.length}`)
    console.log(`  Unique Locations: ${uniqueLocations.length}`)
    console.log(`  Unique Departments: ${uniqueDepartments.length}`)

    console.log("[v0] Sample unique vehicles:", uniqueVehicles.slice(0, 5))
    console.log("[v0] Sample unique drivers:", uniqueDrivers.slice(0, 3))
    console.log("[v0] Sample unique locations:", uniqueLocations)
    console.log("[v0] Sample unique departments:", uniqueDepartments)

    return records
  } catch (error) {
    console.error("[v0] Error parsing test batch:", error)
    return null
  }
}

// Execute the function
parseTestBatch()
