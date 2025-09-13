console.log("[v0] Starting clean import from scratch...")

// CSV URL for test batch
const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables")
}

// Helper function to make Supabase REST API calls
async function supabaseRequest(endpoint, method = "GET", body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`
  const headers = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  }

  const options = { method, headers }
  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase ${method} ${endpoint} failed: ${response.status} ${errorText}`)
  }

  if (method === "GET") {
    return await response.json()
  }
  return response
}

// Function to clear all tables
async function clearAllTables() {
  console.log("[v0] Clearing all existing data...")

  const tables = ["refuel_records", "vehicles", "drivers", "users", "locations", "departments"]

  for (const table of tables) {
    try {
      console.log(`[v0] Clearing ${table} table...`)
      await supabaseRequest(`${table}?select=*`, "DELETE")
      console.log(`[v0] ✓ Cleared ${table} table`)
    } catch (error) {
      console.log(`[v0] Note: Could not clear ${table} (may not exist or be empty): ${error.message}`)
    }
  }
}

// Function to fetch and parse CSV
async function fetchAndParseCSV() {
  console.log("[v0] Fetching CSV data...")

  const response = await fetch(CSV_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status}`)
  }

  const csvText = await response.text()
  const lines = csvText.trim().split("\n")

  if (lines.length < 2) {
    throw new Error("CSV file appears to be empty or invalid")
  }

  const headers = lines[0].split(";")
  const records = []

  // Process first 10 records for testing
  for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
    const values = lines[i].split(";")
    const record = {}

    headers.forEach((header, index) => {
      record[header.trim()] = values[index] ? values[index].trim() : ""
    })

    records.push(record)
  }

  console.log(`[v0] Parsed ${records.length} records from CSV`)
  return records
}

// Function to create departments
async function createDepartments(records) {
  console.log("[v0] Creating departments...")

  const uniqueDepartments = [...new Set(records.map((r) => r["department.name"]).filter(Boolean))]

  for (const deptName of uniqueDepartments) {
    try {
      const department = {
        name: deptName,
        created_at: new Date().toISOString(),
      }

      await supabaseRequest("departments", "POST", department)
      console.log(`[v0] ✓ Created department: ${deptName}`)
    } catch (error) {
      console.log(`[v0] Error creating department ${deptName}: ${error.message}`)
    }
  }
}

// Function to create locations
async function createLocations(records) {
  console.log("[v0] Creating locations...")

  const uniqueLocations = [...new Set(records.map((r) => r["location.name"]).filter(Boolean))]

  for (const locationName of uniqueLocations) {
    try {
      const location = {
        name: locationName,
        created_at: new Date().toISOString(),
      }

      await supabaseRequest("locations", "POST", location)
      console.log(`[v0] ✓ Created location: ${locationName}`)
    } catch (error) {
      console.log(`[v0] Error creating location ${locationName}: ${error.message}`)
    }
  }
}

// Function to create users/drivers
async function createDrivers(records) {
  console.log("[v0] Creating drivers...")

  const uniqueDrivers = [...new Set(records.map((r) => r["driver.name"]).filter(Boolean))]

  for (const driverName of uniqueDrivers) {
    try {
      const user = {
        id: crypto.randomUUID(),
        email: `${driverName.toLowerCase().replace(/\s+/g, ".")}@fleet.local`,
        name: driverName,
        role: "driver",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await supabaseRequest("users", "POST", user)
      console.log(`[v0] ✓ Created driver: ${driverName}`)
    } catch (error) {
      console.log(`[v0] Error creating driver ${driverName}: ${error.message}`)
    }
  }
}

// Function to create vehicles
async function createVehicles(records) {
  console.log("[v0] Creating vehicles...")

  const uniqueVehicles = new Map()

  records.forEach((record) => {
    const internalNumber = record["vehicle.internal_number"]
    const plate = record["vehicle.plate"]

    if (internalNumber && plate) {
      uniqueVehicles.set(internalNumber, plate)
    }
  })

  for (const [internalNumber, plate] of uniqueVehicles) {
    try {
      const vehicle = {
        internal_number: internalNumber,
        license_plate: plate,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await supabaseRequest("vehicles", "POST", vehicle)
      console.log(`[v0] ✓ Created vehicle: ${internalNumber} (${plate})`)
    } catch (error) {
      console.log(`[v0] Error creating vehicle ${internalNumber}: ${error.message}`)
    }
  }
}

// Function to create refuel records
async function createRefuelRecords(records) {
  console.log("[v0] Creating refuel records...")

  // Get lookup data
  const [departments, locations, users, vehicles] = await Promise.all([
    supabaseRequest("departments?select=id,name"),
    supabaseRequest("locations?select=id,name"),
    supabaseRequest("users?select=id,name"),
    supabaseRequest("vehicles?select=id,internal_number,license_plate"),
  ])

  // Create lookup maps
  const deptMap = new Map(departments.map((d) => [d.name, d.id]))
  const locationMap = new Map(locations.map((l) => [l.name, l.id]))
  const userMap = new Map(users.map((u) => [u.name, u.id]))
  const vehicleMap = new Map(vehicles.map((v) => [v.internal_number, v.id]))

  for (let i = 0; i < records.length; i++) {
    const record = records[i]

    try {
      // Parse date (assuming Excel serial number format)
      const dateValue = record["date"]
      let refuelDate

      if (dateValue && !isNaN(dateValue)) {
        // Excel serial date conversion
        const excelEpoch = new Date(1900, 0, 1)
        const days = Number.parseInt(dateValue) - 2 // Excel date adjustment
        refuelDate = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
      } else {
        refuelDate = new Date() // Default to current date
      }

      // Parse numeric values
      const odometer = Number.parseFloat(record["odometer"]) || 0
      const odometerDiff = Number.parseFloat(record["calculated_odometer_diference"]) || 0
      const liters = Number.parseFloat(record["liters"]) || 0
      const pricePerLiter = Number.parseFloat(record["price_liter"]) || 0
      const totalCost = Number.parseFloat(record["total_cost"]) || 0

      // Calculate metrics
      const kmPerLiter = odometerDiff > 0 && liters > 0 ? odometerDiff / liters : 0
      const costPerKm = odometerDiff > 0 && totalCost > 0 ? totalCost / odometerDiff : 0
      const litersPer100Km = odometerDiff > 0 && liters > 0 ? (liters / odometerDiff) * 100 : 0

      const refuelRecord = {
        vehicle_id: vehicleMap.get(record["vehicle.internal_number"]),
        driver_id: userMap.get(record["driver.name"]),
        location_id: locationMap.get(record["location.name"]),
        department_id: deptMap.get(record["department.name"]),
        refuel_date: refuelDate.toISOString().split("T")[0],
        odometer_reading: odometer,
        odometer_difference: odometerDiff,
        liters_consumed: liters,
        price_per_liter: pricePerLiter,
        total_cost: totalCost,
        km_per_liter: kmPerLiter,
        cost_per_km: costPerKm,
        liters_per_100km: litersPer100Km,
        notes: record["notes"] || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await supabaseRequest("refuel_records", "POST", refuelRecord)
      console.log(`[v0] ✓ Created refuel record ${i + 1}`)
    } catch (error) {
      console.log(`[v0] Error creating refuel record ${i + 1}: ${error.message}`)
    }
  }
}

// Main function
async function main() {
  try {
    // Step 1: Clear all existing data
    await clearAllTables()

    // Step 2: Fetch and parse CSV
    const records = await fetchAndParseCSV()

    // Step 3: Create lookup tables
    await createDepartments(records)
    await createLocations(records)
    await createDrivers(records)
    await createVehicles(records)

    // Step 4: Create refuel records
    await createRefuelRecords(records)

    console.log("[v0] ✅ Clean import completed successfully!")
  } catch (error) {
    console.error("[v0] Fatal error:", error)
    throw error
  }
}

// Run the import
main()
