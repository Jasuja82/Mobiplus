// Script to extract and import driver data from CSV
console.log("[v0] Starting driver data import from CSV...")

async function importDriversFromCSV() {
  try {
    // Fetch the CSV data
    console.log("[v0] Fetching CSV data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, size:", csvText.length, "characters")

    // Parse CSV manually (simple approach)
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] CSV Headers:", headers)
    console.log("[v0] Total data rows:", lines.length - 1)

    // Extract unique drivers from CSV
    const driversSet = new Set()
    const driversData = []

    for (let i = 1; i < Math.min(lines.length, 11); i++) {
      // Process first 10 rows to analyze
      const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""))
      const rowData = {}

      headers.forEach((header, index) => {
        rowData[header] = row[index] || ""
      })

      console.log(`[v0] Row ${i} data:`, rowData)

      // Look for driver-related fields
      const driverFields = headers.filter(
        (h) =>
          h.toLowerCase().includes("driver") ||
          h.toLowerCase().includes("condutor") ||
          h.toLowerCase().includes("employee") ||
          h.toLowerCase().includes("funcionario"),
      )

      console.log("[v0] Driver-related fields found:", driverFields)

      // Extract driver information
      driverFields.forEach((field) => {
        const driverValue = rowData[field]
        if (driverValue && driverValue !== "") {
          const driverKey = `${field}:${driverValue}`
          if (!driversSet.has(driverKey)) {
            driversSet.add(driverKey)
            driversData.push({
              field: field,
              value: driverValue,
              sourceRow: i,
            })
          }
        }
      })
    }

    console.log("[v0] Unique drivers found:", driversData.length)
    console.log("[v0] Driver data sample:", driversData.slice(0, 5))

    // Show current database state
    const { createClient } = await import("../lib/supabase/server.js")
    const supabase = createClient()

    // Check existing users and drivers
    const { data: existingUsers, error: usersError } = await supabase.from("users").select("*").limit(10)

    const { data: existingDrivers, error: driversError } = await supabase.from("drivers").select("*").limit(10)

    console.log("[v0] Existing users in database:", existingUsers?.length || 0)
    console.log("[v0] Existing drivers in database:", existingDrivers?.length || 0)

    if (existingUsers?.length > 0) {
      console.log("[v0] Sample existing user:", existingUsers[0])
    }

    if (existingDrivers?.length > 0) {
      console.log("[v0] Sample existing driver:", existingDrivers[0])
    }

    return {
      csvHeaders: headers,
      totalRows: lines.length - 1,
      driversFound: driversData,
      existingUsers: existingUsers?.length || 0,
      existingDrivers: existingDrivers?.length || 0,
    }
  } catch (error) {
    console.error("[v0] Error importing drivers:", error)
    throw error
  }
}

// Execute the import
importDriversFromCSV()
  .then((result) => {
    console.log("[v0] Driver import analysis complete:", result)
  })
  .catch((error) => {
    console.error("[v0] Driver import failed:", error)
  })
