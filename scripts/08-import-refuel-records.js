async function importRefuelRecords() {
  console.log("[v0] Starting refuel records import...")

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
    console.log("[v0] CSV data fetched successfully")
    console.log("[v0] CSV preview:", csvText.substring(0, 500) + "...")

    // Parse CSV manually (simple approach)
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] CSV Headers:", headers)
    console.log("[v0] Total rows:", lines.length - 1)

    // Show first few data rows for verification
    console.log("[v0] Sample data rows:")
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""))
      console.log(`[v0] Row ${i}:`, row)
    }

    // Create a simple mapping object for the first row
    if (lines.length > 1) {
      const firstDataRow = lines[1].split(",").map((cell) => cell.trim().replace(/"/g, ""))
      const rowObject = {}
      headers.forEach((header, index) => {
        rowObject[header] = firstDataRow[index] || ""
      })

      console.log("[v0] First row as object:", rowObject)
    }

    console.log("[v0] CSV analysis complete. Ready for database insertion.")
  } catch (error) {
    console.error("[v0] Error importing refuel records:", error)
    console.error("[v0] Error details:", error.message)
  }
}

// Execute the import
importRefuelRecords()
