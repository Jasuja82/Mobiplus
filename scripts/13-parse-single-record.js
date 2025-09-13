async function parseSingleRecord() {
  try {
    console.log("[v0] Fetching CSV data...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, length:", csvText.length)

    // Split into lines
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log("[v0] Total lines:", lines.length)

    if (lines.length < 2) {
      console.log("[v0] Not enough data in CSV")
      return
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("[v0] Headers found:", headers)
    console.log("[v0] Number of columns:", headers.length)

    // Parse first data record
    const firstRecord = lines[1].split(",").map((cell) => cell.trim().replace(/"/g, ""))
    console.log("[v0] First record values:", firstRecord)
    console.log("[v0] Number of values:", firstRecord.length)

    // Create field mapping
    console.log("\n[v0] FIELD MAPPING FOR FIRST RECORD:")
    console.log("=====================================")

    const mapping = {}
    headers.forEach((header, index) => {
      const value = firstRecord[index] || ""
      mapping[header] = value
      console.log(`${header}: "${value}"`)
    })

    // Identify potential driver fields
    console.log("\n[v0] POTENTIAL DRIVER FIELDS:")
    console.log("=============================")
    const driverFields = headers.filter(
      (h) =>
        h.toLowerCase().includes("driver") ||
        h.toLowerCase().includes("condutor") ||
        h.toLowerCase().includes("name") ||
        h.toLowerCase().includes("nome") ||
        h.toLowerCase().includes("employee") ||
        h.toLowerCase().includes("funcionario"),
    )

    driverFields.forEach((field) => {
      console.log(`${field}: "${mapping[field]}"`)
    })

    // Identify potential vehicle fields
    console.log("\n[v0] POTENTIAL VEHICLE FIELDS:")
    console.log("==============================")
    const vehicleFields = headers.filter(
      (h) =>
        h.toLowerCase().includes("vehicle") ||
        h.toLowerCase().includes("viatura") ||
        h.toLowerCase().includes("plate") ||
        h.toLowerCase().includes("matricula") ||
        h.toLowerCase().includes("number") ||
        h.toLowerCase().includes("numero"),
    )

    vehicleFields.forEach((field) => {
      console.log(`${field}: "${mapping[field]}"`)
    })

    // Identify potential fuel fields
    console.log("\n[v0] POTENTIAL FUEL FIELDS:")
    console.log("===========================")
    const fuelFields = headers.filter(
      (h) =>
        h.toLowerCase().includes("fuel") ||
        h.toLowerCase().includes("combustivel") ||
        h.toLowerCase().includes("liter") ||
        h.toLowerCase().includes("litro") ||
        h.toLowerCase().includes("cost") ||
        h.toLowerCase().includes("custo") ||
        h.toLowerCase().includes("price") ||
        h.toLowerCase().includes("preco"),
    )

    fuelFields.forEach((field) => {
      console.log(`${field}: "${mapping[field]}"`)
    })

    return mapping
  } catch (error) {
    console.error("[v0] Error parsing CSV:", error)
  }
}

// Execute the function
parseSingleRecord()
