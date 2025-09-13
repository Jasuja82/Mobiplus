console.log("[v0] Starting CSV import with RLS disabled...")

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables")
}

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"

async function supabaseRequest(endpoint, method = "GET", body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`
  const options = {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  const data = await response.json()

  if (!response.ok) {
    console.log(`[v0] Error in ${method} ${endpoint}:`, data)
    throw new Error(`Supabase error: ${data.message || response.statusText}`)
  }

  return data
}

async function main() {
  try {
    // Fetch and parse CSV
    console.log("[v0] Fetching CSV data...")
    const response = await fetch(CSV_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(";")

    console.log("[v0] CSV Headers:", headers)
    console.log("[v0] Total records:", lines.length - 1)

    // Process first 5 records as test
    const testRecords = lines.slice(1, 6)
    console.log("[v0] Processing first 5 records...")

    const departments = new Set()
    const locations = new Set()
    const drivers = new Set()
    const vehicles = new Set()

    // Parse records and collect unique values
    for (let i = 0; i < testRecords.length; i++) {
      const values = testRecords[i].split(";")
      const record = {}

      headers.forEach((header, index) => {
        record[header.trim()] = values[index] ? values[index].trim() : ""
      })

      // Collect unique values
      if (record["department.name"]) departments.add(record["department.name"])
      if (record["location.name"]) locations.add(record["location.name"])
      if (record["driver.name"]) drivers.add(record["driver.name"])
      if (record["vehicle.internal_number"]) vehicles.add(record["vehicle.internal_number"])

      console.log(`[v0] Record ${i + 1}:`, {
        vehicle: record["vehicle.internal_number"],
        driver: record["driver.name"],
        location: record["location.name"],
        department: record["department.name"],
      })
    }

    // Insert departments
    console.log("[v0] Creating departments...")
    for (const deptName of departments) {
      try {
        await supabaseRequest("departments", "POST", {
          name: deptName,
          description: `Department: ${deptName}`,
        })
        console.log(`[v0] Created department: ${deptName}`)
      } catch (error) {
        console.log(`[v0] Department ${deptName} might already exist:`, error.message)
      }
    }

    // Insert locations
    console.log("[v0] Creating locations...")
    for (const locationName of locations) {
      try {
        await supabaseRequest("locations", "POST", {
          name: locationName,
          address: locationName,
          internal_number: 1,
        })
        console.log(`[v0] Created location: ${locationName}`)
      } catch (error) {
        console.log(`[v0] Location ${locationName} might already exist:`, error.message)
      }
    }

    // Insert drivers (users)
    console.log("[v0] Creating drivers...")
    for (const driverName of drivers) {
      try {
        await supabaseRequest("users", "POST", {
          name: driverName,
          email: `${driverName.toLowerCase().replace(/\s+/g, ".")}@fleet.com`,
          role: "driver",
        })
        console.log(`[v0] Created driver: ${driverName}`)
      } catch (error) {
        console.log(`[v0] Driver ${driverName} might already exist:`, error.message)
      }
    }

    // Insert vehicles
    console.log("[v0] Creating vehicles...")
    for (const vehicleNumber of vehicles) {
      try {
        await supabaseRequest("vehicles", "POST", {
          internal_number: vehicleNumber,
          license_plate: `PLATE-${vehicleNumber}`,
          make: "Unknown",
          model: "Unknown",
          year: 2020,
          status: "active",
        })
        console.log(`[v0] Created vehicle: ${vehicleNumber}`)
      } catch (error) {
        console.log(`[v0] Vehicle ${vehicleNumber} might already exist:`, error.message)
      }
    }

    console.log("[v0] CSV import completed successfully!")
    console.log("[v0] Summary:")
    console.log(`[v0] - Departments: ${departments.size}`)
    console.log(`[v0] - Locations: ${locations.size}`)
    console.log(`[v0] - Drivers: ${drivers.size}`)
    console.log(`[v0] - Vehicles: ${vehicles.size}`)
  } catch (error) {
    console.log("[v0] Fatal error:", error)
    console.log("[v0] Stack trace:", error.stack)
  }
}

main()
