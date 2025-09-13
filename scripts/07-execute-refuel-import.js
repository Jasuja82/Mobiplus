console.log("[v0] Starting refuel records import process...")

// First, let's check if we have any existing data
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentData() {
  console.log("[v0] Checking current database state...")

  const { data: refuels, error: refuelError } = await supabase.from("refuel_records").select("count")

  const { data: vehicles, error: vehicleError } = await supabase.from("vehicles").select("count")

  const { data: drivers, error: driverError } = await supabase.from("drivers").select("count")

  const { data: locations, error: locationError } = await supabase.from("locations").select("count")

  console.log("[v0] Current record counts:")
  console.log("- Refuel records:", refuels?.[0]?.count || 0)
  console.log("- Vehicles:", vehicles?.[0]?.count || 0)
  console.log("- Drivers:", drivers?.[0]?.count || 0)
  console.log("- Locations:", locations?.[0]?.count || 0)
}

async function importRefuelData() {
  console.log("[v0] Fetching CSV data...")

  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )
    const csvText = await response.text()

    console.log("[v0] CSV data fetched, parsing...")
    console.log("[v0] First 500 characters:", csvText.substring(0, 500))

    // Parse CSV manually (simple approach)
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] CSV Headers:", headers)
    console.log("[v0] Total data rows:", lines.length - 1)

    // Process each row
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (let i = 1; i < Math.min(lines.length, 11); i++) {
      // Process first 10 rows for testing
      try {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const record = {}

        headers.forEach((header, index) => {
          record[header] = values[index] || null
        })

        console.log(`[v0] Processing row ${i}:`, record)

        // Here you would process each record and insert into appropriate tables
        // This is a placeholder - you'll need to map your CSV columns to database fields

        successCount++
      } catch (error) {
        console.error(`[v0] Error processing row ${i}:`, error.message)
        errors.push({ row: i, error: error.message })
        errorCount++
      }
    }

    console.log("[v0] Import summary:")
    console.log("- Successful records:", successCount)
    console.log("- Failed records:", errorCount)
    if (errors.length > 0) {
      console.log("- Errors:", errors)
    }
  } catch (error) {
    console.error("[v0] Failed to fetch or process CSV:", error.message)
  }
}

// Execute the import
checkCurrentData()
  .then(() => importRefuelData())
  .then(() => console.log("[v0] Refuel import process completed"))
  .catch((error) => console.error("[v0] Import process failed:", error))
