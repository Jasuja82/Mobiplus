async function importRefuelRecordsBatched() {
  console.log("[v0] Starting batched refuel import...")

  try {
    // Fetch CSV data
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )
    const csvText = await response.text()

    console.log("[v0] CSV fetched, size:", csvText.length, "characters")

    // Parse CSV
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const dataRows = lines.slice(1)

    console.log("[v0] Headers:", headers)
    console.log("[v0] Total rows to process:", dataRows.length)

    // Process in batches of 100
    const BATCH_SIZE = 100
    const totalBatches = Math.ceil(dataRows.length / BATCH_SIZE)

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * BATCH_SIZE
      const endIndex = Math.min(startIndex + BATCH_SIZE, dataRows.length)
      const batchRows = dataRows.slice(startIndex, endIndex)

      console.log(`[v0] Processing batch ${batchIndex + 1}/${totalBatches} (rows ${startIndex + 1}-${endIndex})`)

      // Process this batch
      const batchData = batchRows.map((row) => {
        const values = row.split(",").map((v) => v.trim().replace(/"/g, ""))
        const record = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || null
        })
        return record
      })

      console.log("[v0] Sample record from batch:", batchData[0])

      // Add delay between batches to avoid rate limits
      if (batchIndex > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay
      }
    }

    console.log("[v0] Batched processing complete!")
  } catch (error) {
    console.error("[v0] Import error:", error)
  }
}

importRefuelRecordsBatched()
