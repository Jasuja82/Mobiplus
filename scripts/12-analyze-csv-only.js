async function analyzeCsvData() {
  try {
    console.log("[v0] Starting CSV analysis...")

    // Fetch the CSV file
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv"
    console.log("[v0] Fetching CSV from:", csvUrl)

    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, length:", csvText.length)

    // Parse CSV manually (simple approach)
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log("[v0] Total lines in CSV:", lines.length)

    if (lines.length === 0) {
      console.log("[v0] No data found in CSV")
      return
    }

    // Get headers
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("[v0] CSV Headers:", headers)

    // Show first few data rows
    console.log("[v0] First 3 data rows:")
    for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
      const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""))
      console.log(`Row ${i}:`, row)
    }

    // Analyze driver-related fields
    const driverFields = headers.filter(
      (header) =>
        header.toLowerCase().includes("driver") ||
        header.toLowerCase().includes("condutor") ||
        header.toLowerCase().includes("name") ||
        header.toLowerCase().includes("nome") ||
        header.toLowerCase().includes("employee") ||
        header.toLowerCase().includes("funcionario"),
    )

    console.log("[v0] Potential driver fields:", driverFields)

    // Extract unique drivers from the data
    const drivers = new Set()
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""))
      driverFields.forEach((field) => {
        const fieldIndex = headers.indexOf(field)
        if (fieldIndex !== -1 && row[fieldIndex]) {
          drivers.add(row[fieldIndex])
        }
      })
    }

    console.log("[v0] Unique drivers found:", Array.from(drivers))
    console.log("[v0] Total unique drivers:", drivers.size)
  } catch (error) {
    console.error("[v0] Error analyzing CSV:", error)
  }
}

// Run the analysis
analyzeCsvData()
