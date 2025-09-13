// Script to fetch and analyze the CSV data structure
async function analyzeCsvData() {
  try {
    console.log("[v0] Fetching CSV data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV data fetched successfully")
    console.log("[v0] First 1000 characters:", csvText.substring(0, 1000))

    // Parse CSV manually to understand structure
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] Headers found:", headers)
    console.log("[v0] Total rows:", lines.length - 1)

    // Analyze first few data rows
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      if (lines[i].trim()) {
        const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""))
        console.log(`[v0] Row ${i}:`, row)
      }
    }

    // Analyze unique values for key fields
    const uniqueValues = {}
    headers.forEach((header) => {
      uniqueValues[header] = new Set()
    })

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""))
        headers.forEach((header, index) => {
          if (row[index]) {
            uniqueValues[header].add(row[index])
          }
        })
      }
    }

    // Log unique counts
    Object.keys(uniqueValues).forEach((header) => {
      console.log(`[v0] ${header}: ${uniqueValues[header].size} unique values`)
      if (uniqueValues[header].size <= 10) {
        console.log(`[v0] ${header} values:`, Array.from(uniqueValues[header]))
      }
    })
  } catch (error) {
    console.error("[v0] Error analyzing CSV:", error)
  }
}

analyzeCsvData()
