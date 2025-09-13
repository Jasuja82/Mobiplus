import { createClient } from "@supabase/supabase-js"

console.log("[v0] Starting simple database insertion test...")

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("[v0] Supabase URL exists:", !!supabaseUrl)
console.log("[v0] Supabase Key exists:", !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseInsertion() {
  try {
    console.log("[v0] Step 1: Fetching CSV data...")

    // Fetch CSV data
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Combustivel%20Frota%20Mobiazores%202025-YdJhvdGJqtOYkKJhJGvhJGvhJGvhJG.csv",
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, length:", csvText.length)

    // Parse CSV
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(";").map((h) => h.trim())
    const firstDataRow = lines[1].split(";").map((d) => d.trim())

    console.log("[v0] Step 2: Parsing first record...")
    console.log("[v0] Headers:", headers)
    console.log("[v0] First data row:", firstDataRow)

    // Create record object
    const record = {}
    headers.forEach((header, index) => {
      record[header] = firstDataRow[index] || ""
    })

    console.log("[v0] Step 3: Parsed record object:")
    console.log(record)

    // Test simple database query first
    console.log("[v0] Step 4: Testing database connection...")
    const { data: testData, error: testError } = await supabase.from("drivers").select("count").limit(1)

    if (testError) {
      console.error("[v0] Database connection test failed:", testError)
      return
    }

    console.log("[v0] Database connection successful")

    // Try to insert a simple test record into drivers table
    console.log("[v0] Step 5: Testing simple insertion...")

    const testDriverName = record["driver.name"] || "Test Driver"
    console.log("[v0] Attempting to insert driver:", testDriverName)

    // Check if driver already exists
    const { data: existingDriver, error: checkError } = await supabase
      .from("users")
      .select("id, name")
      .eq("name", testDriverName)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[v0] Error checking existing driver:", checkError)
      return
    }

    let driverId
    if (existingDriver) {
      console.log("[v0] Driver already exists:", existingDriver)
      driverId = existingDriver.id
    } else {
      console.log("[v0] Creating new driver...")
      const { data: newDriver, error: insertError } = await supabase
        .from("users")
        .insert({
          name: testDriverName,
          email: `${testDriverName.toLowerCase().replace(/\s+/g, ".")}@test.com`,
          role: "driver",
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Error inserting driver:", insertError)
        return
      }

      console.log("[v0] Driver created successfully:", newDriver)
      driverId = newDriver.id
    }

    console.log("[v0] === TEST COMPLETED SUCCESSFULLY ===")
    console.log("[v0] Driver ID:", driverId)
  } catch (error) {
    console.error("[v0] Fatal error in test:", error)
    console.error("[v0] Error stack:", error.stack)
  }
}

// Run the test
testDatabaseInsertion()
