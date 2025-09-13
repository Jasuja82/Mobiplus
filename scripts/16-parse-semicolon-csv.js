console.log("[v0] Starting semicolon CSV parser...")

const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv"

async function parseSemicolonCSV() {
  try {
    console.log("[v0] Fetching CSV from:", csvUrl)
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, length:", csvText.length)

    // Split by lines and filter out empty lines
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log("[v0] Total lines:", lines.length)

    // Parse headers (first line, split by semicolon)
    const headers = lines[0].split(";").map((h) => h.trim())
    console.log("[v0] Headers:", headers)

    // Parse first few data rows
    console.log("\n[v0] Parsing first 3 data rows:")

    for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
      const values = lines[i].split(";").map((v) => v.trim())
      console.log(`\n[v0] Row ${i}:`)

      // Create mapping object
      const record = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })

      console.log("  Raw data:", values)
      console.log("  Mapped record:", record)

      // Categorize by database tables
      const tableData = {
        vehicle: {
          internal_number: record["vehicle.internal_number"],
          plate: record["vehicle.plate"],
        },
        location: {
          name: record["location.name"],
          internal_number: record["location.internal_number"],
        },
        driver: {
          name: record["driver.name"],
        },
        department: {
          name: record["department.name"],
        },
        refuel_record: {
          date: record["date"],
          odometer: record["odometer"],
          calculated_odometer_difference: record["calculated_odometer_diference"],
          liters: record["liters"],
          price_liter: record["price_liter"],
          total_cost: record["total_cost"],
          notes: record["notes"],
        },
      }

      console.log("  Categorized data:", tableData)
    }

    // Get unique values for each category
    console.log("\n[v0] Analyzing unique values across all records...")

    const uniqueVehicles = new Set()
    const uniqueLocations = new Set()
    const uniqueDrivers = new Set()
    const uniqueDepartments = new Set()

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(";").map((v) => v.trim())
      const record = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })

      uniqueVehicles.add(`${record["vehicle.internal_number"]} - ${record["vehicle.plate"]}`)
      uniqueLocations.add(`${record["location.internal_number"]} - ${record["location.name"]}`)
      uniqueDrivers.add(record["driver.name"])
      uniqueDepartments.add(record["department.name"])
    }

    console.log("\n[v0] Summary:")
    console.log("  Total refuel records:", lines.length - 1)
    console.log("  Unique vehicles:", uniqueVehicles.size)
    console.log("  Unique locations:", uniqueLocations.size)
    console.log("  Unique drivers:", uniqueDrivers.size)
    console.log("  Unique departments:", uniqueDepartments.size)

    console.log("\n[v0] Unique vehicles:")
    Array.from(uniqueVehicles)
      .slice(0, 10)
      .forEach((v) => console.log("  -", v))
    if (uniqueVehicles.size > 10) console.log("  ... and", uniqueVehicles.size - 10, "more")

    console.log("\n[v0] Unique drivers:")
    Array.from(uniqueDrivers)
      .slice(0, 10)
      .forEach((d) => console.log("  -", d))
    if (uniqueDrivers.size > 10) console.log("  ... and", uniqueDrivers.size - 10, "more")

    console.log("\n[v0] Unique locations:")
    Array.from(uniqueLocations).forEach((l) => console.log("  -", l))

    console.log("\n[v0] Unique departments:")
    Array.from(uniqueDepartments).forEach((d) => console.log("  -", d))

    console.log("\n[v0] CSV parsing completed successfully!")
  } catch (error) {
    console.error("[v0] Error parsing CSV:", error)
  }
}

parseSemicolonCSV()
