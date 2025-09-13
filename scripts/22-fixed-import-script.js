// Fixed CSV Import Script - Uses INSERT instead of upsert to avoid constraint issues
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log("[v0] Starting fixed CSV import...")
console.log("[v0] Supabase URL:", supabaseUrl ? "Found" : "Missing")
console.log("[v0] Supabase Key:", supabaseKey ? "Found" : "Missing")

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to safely execute database operations
async function safeQuery(operation, query, data = null) {
  try {
    console.log(`[v0] DEBUG: Starting ${operation} on table '${query}'`)
    console.log(`[v0] DEBUG: Data to insert:`, JSON.stringify(data, null, 2))

    let result
    if (data) {
      result = await supabase.from(query).insert(data).select()
    } else {
      result = await supabase.from(query).select()
    }

    console.log(`[v0] DEBUG: Raw result:`, JSON.stringify(result, null, 2))

    if (result.error) {
      console.log(`[v0] ERROR: ${operation} failed with error:`, result.error)
      console.log(`[v0] ERROR: Error code:`, result.error.code)
      console.log(`[v0] ERROR: Error details:`, result.error.details)
      console.log(`[v0] ERROR: Error hint:`, result.error.hint)
      return { success: false, error: result.error }
    }

    console.log(`[v0] SUCCESS: ${operation} completed successfully`)
    return { success: true, data: result.data }
  } catch (error) {
    console.log(`[v0] EXCEPTION: ${operation} threw exception:`, error)
    console.log(`[v0] EXCEPTION: Stack trace:`, error.stack)
    return { success: false, error }
  }
}

// Helper function to check if record exists
async function recordExists(table, field, value) {
  try {
    console.log(`[v0] DEBUG: Checking if record exists in '${table}' where '${field}' = '${value}'`)
    const result = await supabase.from(table).select("id").eq(field, value).single()

    console.log(`[v0] DEBUG: Record exists check result:`, JSON.stringify(result, null, 2))

    if (result.error && result.error.code !== "PGRST116") {
      console.log(`[v0] ERROR: Record exists check failed:`, result.error)
      return null
    }

    const exists = result.data ? result.data.id : null
    console.log(`[v0] DEBUG: Record ${exists ? "EXISTS" : "NOT FOUND"} with ID:`, exists)
    return exists
  } catch (error) {
    console.log(`[v0] EXCEPTION: Record exists check threw exception:`, error)
    return null
  }
}

async function importCSVData() {
  try {
    console.log("[v0] Starting fixed CSV import...")
    console.log("[v0] DEBUG: Environment check...")
    console.log("[v0] Supabase URL:", supabaseUrl ? "Found" : "Missing")
    console.log("[v0] Supabase Key:", supabaseKey ? "Found" : "Missing")

    console.log("[v0] DEBUG: Fetching CSV data...")
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv"
    console.log("[v0] DEBUG: CSV URL:", csvUrl)

    const response = await fetch(csvUrl)
    console.log("[v0] DEBUG: Fetch response status:", response.status)
    console.log("[v0] DEBUG: Fetch response ok:", response.ok)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("[v0] DEBUG: CSV text length:", csvText.length)
    console.log("[v0] DEBUG: First 200 chars:", csvText.substring(0, 200))

    // Parse CSV (semicolon-delimited)
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(";")

    console.log("[v0] CSV Headers:", headers)

    // Process first 5 records for testing
    const records = []
    for (let i = 1; i <= Math.min(6, lines.length - 1); i++) {
      const values = lines[i].split(";")

      const record = {
        vehicle_internal_number: values[0]?.trim() || "",
        vehicle_plate: values[1]?.trim() || "",
        date: values[2]?.trim() || "",
        location_name: values[3]?.trim() || "",
        location_internal_number: values[4]?.trim() || "",
        driver_name: values[5]?.trim() || "",
        department_name: values[6]?.trim() || "",
        odometer: Number.parseInt(values[7]) || 0,
        calculated_odometer_difference: Number.parseInt(values[8]) || 0,
        liters: Number.parseFloat(values[9]) || 0,
        price_liter: Number.parseFloat(values[10]) || 0,
        total_cost: Number.parseFloat(values[11]) || 0,
        notes: values[12]?.trim() || "",
      }

      records.push(record)
    }

    console.log(`[v0] Parsed records: ${records.length}`)
    console.log("[v0] Sample record:", records[0])

    // Extract unique values
    const uniqueDepartments = [...new Set(records.map((r) => r.department_name).filter(Boolean))]
    const uniqueLocations = [...new Set(records.map((r) => r.location_name).filter(Boolean))]
    const uniqueDrivers = [...new Set(records.map((r) => r.driver_name).filter(Boolean))]
    const uniqueVehicles = [...new Set(records.map((r) => r.vehicle_internal_number).filter(Boolean))]

    console.log(`[v0] Unique departments: ${uniqueDepartments.length}`)
    console.log(`[v0] Unique locations: ${uniqueLocations.length}`)
    console.log(`[v0] Unique drivers: ${uniqueDrivers.length}`)
    console.log(`[v0] Unique vehicles: ${uniqueVehicles.length}`)

    // Insert departments
    console.log("[v0] DEBUG: Processing departments...")
    for (const deptName of uniqueDepartments) {
      console.log(`[v0] DEBUG: Processing department: '${deptName}'`)
      const existingId = await recordExists("departments", "name", deptName)
      if (!existingId) {
        console.log(`[v0] DEBUG: Creating new department: '${deptName}'`)
        const result = await safeQuery("department insert", "departments", {
          name: deptName,
          description: `Department: ${deptName}`,
        })
        if (result.success) {
          console.log(`[v0] SUCCESS: Created department: ${deptName}`)
        } else {
          console.log(`[v0] FAILED: Could not create department: ${deptName}`)
        }
      } else {
        console.log(`[v0] SKIP: Department exists: ${deptName}`)
      }
    }

    // Insert locations
    console.log("[v0] DEBUG: Processing locations...")
    for (const locationName of uniqueLocations) {
      console.log(`[v0] DEBUG: Processing location: '${locationName}'`)
      const existingId = await recordExists("locations", "name", locationName)
      if (!existingId) {
        console.log(`[v0] DEBUG: Creating new location: '${locationName}'`)
        const result = await safeQuery("location insert", "locations", {
          name: locationName,
          internal_number: records.find((r) => r.location_name === locationName)?.location_internal_number || "1",
          city: locationName,
          is_active: true,
        })
        if (result.success) {
          console.log(`[v0] SUCCESS: Created location: ${locationName}`)
        } else {
          console.log(`[v0] FAILED: Could not create location: ${locationName}`)
        }
      } else {
        console.log(`[v0] SKIP: Location exists: ${locationName}`)
      }
    }

    // Insert users/drivers
    console.log("[v0] DEBUG: Processing drivers...")
    for (const driverName of uniqueDrivers) {
      console.log(`[v0] DEBUG: Processing driver: '${driverName}'`)
      const existingId = await recordExists("users", "name", driverName)
      if (!existingId) {
        console.log(`[v0] DEBUG: Creating new user: '${driverName}'`)
        const result = await safeQuery("user insert", "users", {
          name: driverName,
          email: `${driverName.toLowerCase().replace(/\s+/g, ".")}@mobiazores.pt`,
          role: "driver",
          is_active: true,
        })
        if (result.success) {
          console.log(`[v0] SUCCESS: Created user: ${driverName}`)
        } else {
          console.log(`[v0] FAILED: Could not create user: ${driverName}`)
        }
      } else {
        console.log(`[v0] SKIP: User exists: ${driverName}`)
      }
    }

    // Insert vehicles
    console.log("[v0] DEBUG: Processing vehicles...")
    for (const vehicleNumber of uniqueVehicles) {
      console.log(`[v0] DEBUG: Processing vehicle: '${vehicleNumber}'`)
      const existingId = await recordExists("vehicles", "internal_number", vehicleNumber)
      if (!existingId) {
        console.log(`[v0] DEBUG: Creating new vehicle: '${vehicleNumber}'`)
        const vehicleRecord = records.find((r) => r.vehicle_internal_number === vehicleNumber)
        const result = await safeQuery("vehicle insert", "vehicles", {
          internal_number: vehicleNumber,
          vehicle_number: vehicleNumber,
          license_plate: vehicleRecord?.vehicle_plate || "",
          make: "Unknown",
          model: "Unknown",
          year: 2020,
          status: "active",
          current_mileage: vehicleRecord?.odometer || 0,
        })
        if (result.success) {
          console.log(`[v0] SUCCESS: Created vehicle: ${vehicleNumber}`)
        } else {
          console.log(`[v0] FAILED: Could not create vehicle: ${vehicleNumber}`)
        }
      } else {
        console.log(`[v0] SKIP: Vehicle exists: ${vehicleNumber}`)
      }
    }

    console.log("[v0] Basic data import completed successfully!")
    console.log("[v0] Next step: Import refuel records with proper relationships")
  } catch (error) {
    console.log("[v0] CRITICAL ERROR: Import failed with exception:", error)
    console.log("[v0] CRITICAL ERROR: Stack trace:", error.stack)
    throw error
  }
}

// Run the import
await importCSVData()
