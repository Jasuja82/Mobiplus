console.log("[v0] Starting CSV debug fetch...")

const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv"

try {
  console.log("[v0] Fetching CSV from:", csvUrl)

  const response = await fetch(csvUrl)
  console.log("[v0] Response status:", response.status)
  console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const csvText = await response.text()
  console.log("[v0] CSV text length:", csvText.length)
  console.log("[v0] First 500 characters:")
  console.log(csvText.substring(0, 500))

  // Split into lines
  const lines = csvText.split("\n").filter((line) => line.trim())
  console.log("[v0] Total lines:", lines.length)

  if (lines.length > 0) {
    console.log("[v0] Headers (first line):")
    console.log(lines[0])

    // Parse headers
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("[v0] Parsed headers:", headers)

    if (lines.length > 1) {
      console.log("[v0] First data row:")
      console.log(lines[1])

      // Parse first data row
      const firstRow = lines[1].split(",").map((v) => v.trim().replace(/"/g, ""))
      console.log("[v0] Parsed first row:", firstRow)

      // Show header-value mapping
      console.log("[v0] Header-Value mapping:")
      headers.forEach((header, index) => {
        console.log(`  ${header}: ${firstRow[index] || "undefined"}`)
      })
    }
  }
} catch (error) {
  console.error("[v0] Error fetching CSV:", error.message)
  console.error("[v0] Full error:", error)
}

console.log("[v0] CSV debug completed!")
