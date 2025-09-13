// Working CSV Import Script
// Uses proven CSV access and database operations

console.log("[v0] Starting working CSV import...")

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[v0] Missing Supabase environment variables")
  process.exit(1)
}

// CSV URL (test batch)
const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"

// Helper function for database operations
async function supabaseRequest(endpoint, method = "GET", body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`
  const options = {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  console.log(`[v0] ${method} ${endpoint}`)
  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[v0] Database error: ${response.status} - ${errorText}`)
    throw new Error(`Database error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

// Helper function to check if record exists
async function recordExists(table, field, value) {
  try {
    const result = await supabaseRequest(`${table}?${field}=eq.${encodeURIComponent(value)}&select=id`)
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error(`[v0] Error checking ${table}:`, error.message)
    return null
  }
}

// Helper function to insert record if not exists
async function insertIfNotExists(table, data, checkField) {
  try {
    const existing = await recordExists(table, checkField, data[checkField])
    if (existing) {
      console.log(`[v0] ${table} already exists: ${data[checkField]}`)
      return existing
    }

    const result = await supabaseRequest(table, "POST", data)
    console.log(`[v0] Created ${table}: ${data[checkField]}`)
    return result[0]
  } catch (error) {
    console.error(`[v0] Error inserting ${table}:`, error.message)
    throw error
  }
}

async function main() {
  try {
    // Step 1: Fetch and parse CSV
    console.log("[v0] Fetching CSV data...")
    const response = await fetch(CSV_URL)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      throw new Error("CSV file appears to be empty or invalid")
    }

    // Parse headers and data
    const headers = lines[0].split(";").map((h) => h.trim().replace(/\r$/, ""))
    const dataLines = lines.slice(1)

    console.log(`[v0] Parsed ${dataLines.length} records from CSV`)
    console.log(`[v0] Headers:`, headers)

    // Step 2: Process first 5 records as test
    const testRecords = dataLines.slice(0, 5)
    console.log(`[v0] Processing ${testRecords.length} test records...`)

    for (let i = 0; i < testRecords.length; i++) {
      const line = testRecords[i]
      const values = line.split(";").map((v) => v.trim().replace(/\r$/, ""))

      if (values.length !== headers.length) {
        console.log(`[v0] Skipping malformed record ${i + 1}: ${values.length} values vs ${headers.length} headers`)
        continue
      }

      // Map values to object
      const record = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })

      console.log(`[v0] Processing record ${i + 1}:`, {
        vehicle: record["vehicle.internal_number"],
        plate: record["vehicle.plate"],
        driver: record["driver.name"],
        location: record["location.name"],
        department: record["department.name"],
      })

      try {
        // Step 3: Create department
        if (record["department.name"]) {
          await insertIfNotExists(
            "departments",
            {
              name: record["department.name"],
              description: `Department: ${record["department.name"]}`,
            },
            "name",
          )
        }

        // Step 4: Create location
        if (record["location.name"] && record["location.internal_number"]) {
          await insertIfNotExists(
            "locations",
            {
              name: record["location.name"],
              internal_number: Number.parseInt(record["location.internal_number"]) || 0,
              address: record["location.name"],
            },
            "name",
          )
        }

        // Step 5: Create user/driver
        if (record["driver.name"]) {
          await insertIfNotExists(
            "users",
            {
              name: record["driver.name"],
              email: `${record["driver.name"].toLowerCase().replace(/\s+/g, ".")}@fleet.local`,
              role: "driver",
            },
            "name",
          )
        }

        // Step 6: Create vehicle
        if (record["vehicle.internal_number"] && record["vehicle.plate"]) {
          await insertIfNotExists(
            "vehicles",
            {
              internal_number: record["vehicle.internal_number"],
              license_plate: record["vehicle.plate"],
              make: "Unknown",
              model: "Unknown",
              year: 2020,
              current_mileage: Number.parseInt(record["odometer"]) || 0,
            },
            "internal_number",
          )
        }

        console.log(`[v0] Successfully processed record ${i + 1}`)
      } catch (error) {
        console.error(`[v0] Error processing record ${i + 1}:`, error.message)
        // Continue with next record
      }
    }

    console.log("[v0] Import completed successfully!")

    // Step 7: Show summary
    console.log("[v0] Checking final counts...")
    try {
      const departments = await supabaseRequest("departments?select=count")
      const locations = await supabaseRequest("locations?select=count")
      const users = await supabaseRequest("users?select=count")
      const vehicles = await supabaseRequest("vehicles?select=count")

      console.log("[v0] Final summary:")
      console.log(`[v0] - Departments: ${departments.length || "unknown"}`)
      console.log(`[v0] - Locations: ${locations.length || "unknown"}`)
      console.log(`[v0] - Users: ${users.length || "unknown"}`)
      console.log(`[v0] - Vehicles: ${vehicles.length || "unknown"}`)
    } catch (error) {
      console.log("[v0] Could not get final counts:", error.message)
    }
  } catch (error) {
    console.error("[v0] Fatal error:", error.message)
    console.error("[v0] Stack trace:", error.stack)
  }
}

main()
