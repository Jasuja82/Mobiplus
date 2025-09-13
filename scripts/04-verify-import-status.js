// Script to verify CSV import status and identify failed records
async function verifyImportStatus() {
  console.log("[v0] Starting import verification...")

  try {
    // Fetch the original CSV data
    const csvResponse = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )
    const csvText = await csvResponse.text()

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const csvRecords = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
      const record = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })
      return record
    })

    console.log(`[v0] Found ${csvRecords.length} records in CSV`)
    console.log(`[v0] CSV Headers:`, headers)

    // Check database counts
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const checkTable = async (tableName) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=count`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "count=exact",
        },
      })

      const count = response.headers.get("content-range")?.split("/")[1] || "0"
      return Number.parseInt(count)
    }

    // Check all relevant tables
    const tableCounts = {
      vehicles: await checkTable("vehicles"),
      drivers: await checkTable("drivers"),
      locations: await checkTable("locations"),
      departments: await checkTable("departments"),
      fuel_stations: await checkTable("fuel_stations"),
      refuel_records: await checkTable("refuel_records"),
    }

    console.log("[v0] Database record counts:")
    Object.entries(tableCounts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} records`)
    })

    // Analyze unique values from CSV
    const uniqueValues = {
      vehicles: new Set(),
      drivers: new Set(),
      locations: new Set(),
      departments: new Set(),
      fuel_stations: new Set(),
    }

    csvRecords.forEach((record) => {
      // Extract unique identifiers (adjust based on actual CSV structure)
      if (record.Vehicle) uniqueValues.vehicles.add(record.Vehicle)
      if (record.Driver) uniqueValues.drivers.add(record.Driver)
      if (record.Location) uniqueValues.locations.add(record.Location)
      if (record.Department) uniqueValues.departments.add(record.Department)
      if (record["Fuel Station"]) uniqueValues.fuel_stations.add(record["Fuel Station"])
    })

    console.log("[v0] Unique values in CSV:")
    Object.entries(uniqueValues).forEach(([type, set]) => {
      console.log(`  ${type}: ${set.size} unique values`)
      console.log(`    Examples: ${Array.from(set).slice(0, 3).join(", ")}`)
    })

    // Check for potential import issues
    const issues = []

    if (tableCounts.refuel_records === 0) {
      issues.push("No refuel records imported - check CSV parsing and data format")
    }

    if (tableCounts.vehicles < uniqueValues.vehicles.size) {
      issues.push(
        `Vehicle mismatch: CSV has ${uniqueValues.vehicles.size} unique vehicles, DB has ${tableCounts.vehicles}`,
      )
    }

    if (tableCounts.drivers < uniqueValues.drivers.size) {
      issues.push(`Driver mismatch: CSV has ${uniqueValues.drivers.size} unique drivers, DB has ${tableCounts.drivers}`)
    }

    if (issues.length > 0) {
      console.log("[v0] Potential issues found:")
      issues.forEach((issue) => console.log(`  - ${issue}`))
    } else {
      console.log("[v0] Import appears successful!")
    }

    // Sample a few CSV records for detailed analysis
    console.log("[v0] Sample CSV records:")
    csvRecords.slice(0, 3).forEach((record, index) => {
      console.log(`  Record ${index + 1}:`, record)
    })

    return {
      csvRecordCount: csvRecords.length,
      databaseCounts: tableCounts,
      uniqueValueCounts: Object.fromEntries(Object.entries(uniqueValues).map(([key, set]) => [key, set.size])),
      issues,
      sampleRecords: csvRecords.slice(0, 3),
    }
  } catch (error) {
    console.error("[v0] Error verifying import:", error)
    return { error: error.message }
  }
}

// Run verification
verifyImportStatus().then((result) => {
  console.log("[v0] Verification complete:", result)
})
