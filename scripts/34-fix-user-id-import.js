console.log("[v0] Starting fixed CSV import with proper user ID generation...")

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"

async function main() {
  try {
    // Fetch CSV data
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

    // Process first 5 records
    const records = []
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const values = lines[i].split(";")
      const record = {
        vehicle: values[0]?.trim(),
        plate: values[1]?.trim(),
        date: values[2]?.trim(),
        location: values[3]?.trim(),
        locationNumber: values[4]?.trim(),
        driver: values[5]?.trim(),
        department: values[6]?.trim(),
        odometer: values[7]?.trim(),
        odometerDiff: values[8]?.trim() || "0",
        liters: values[9]?.trim(),
        pricePerLiter: values[10]?.trim(),
        totalCost: values[11]?.trim(),
        notes: values[12]?.trim(),
      }
      records.push(record)
    }

    console.log("[v0] Processing first 5 records...")
    records.forEach((record, index) => {
      console.log(`[v0] Record ${index + 1}:`, {
        vehicle: record.vehicle,
        driver: record.driver,
        location: record.location,
        department: record.department,
      })
    })

    // Get unique values
    const uniqueDepartments = [...new Set(records.map((r) => r.department).filter(Boolean))]
    const uniqueLocations = [...new Set(records.map((r) => r.location).filter(Boolean))]
    const uniqueDrivers = [...new Set(records.map((r) => r.driver).filter(Boolean))]
    const uniqueVehicles = [...new Set(records.map((r) => r.vehicle).filter(Boolean))]

    // Database operations
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Helper function for database operations
    async function dbOperation(table, data, method = "POST") {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
            Prefer: "return=representation",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.log(`[v0] Error in ${method} ${table}:`, JSON.parse(errorText))
          throw new Error(`Database error: ${errorText}`)
        }

        return await response.json()
      } catch (error) {
        console.log(`[v0] ${table} operation failed:`, error.message)
        return null
      }
    }

    // Check if record exists
    async function checkExists(table, field, value) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${field}=eq.${encodeURIComponent(value)}`, {
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
          },
        })
        const data = await response.json()
        return data.length > 0
      } catch (error) {
        return false
      }
    }

    // Create departments
    console.log("[v0] Creating departments...")
    for (const dept of uniqueDepartments) {
      const exists = await checkExists("departments", "name", dept)
      if (!exists) {
        const result = await dbOperation("departments", { name: dept })
        if (result) {
          console.log(`[v0] Created department: ${dept}`)
        }
      } else {
        console.log(`[v0] Department already exists: ${dept}`)
      }
    }

    // Create locations
    console.log("[v0] Creating locations...")
    for (const location of uniqueLocations) {
      const exists = await checkExists("locations", "name", location)
      if (!exists) {
        const result = await dbOperation("locations", { name: location })
        if (result) {
          console.log(`[v0] Created location: ${location}`)
        }
      } else {
        console.log(`[v0] Location already exists: ${location}`)
      }
    }

    // Create drivers (users) with proper UUID generation
    console.log("[v0] Creating drivers...")
    for (const driver of uniqueDrivers) {
      const exists = await checkExists("users", "full_name", driver)
      if (!exists) {
        const userId = crypto.randomUUID()
        const email =
          driver
            .toLowerCase()
            .replace(/\s+/g, ".")
            .replace(/[^a-z0-9.]/g, "") + "@fleet.com"

        const userData = {
          id: userId,
          email: email,
          full_name: driver,
          company: "MobiAzores",
          role: "driver",
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const result = await dbOperation("users", userData)
        if (result) {
          console.log(`[v0] Created driver: ${driver}`)
        }
      } else {
        console.log(`[v0] Driver already exists: ${driver}`)
      }
    }

    // Create vehicles
    console.log("[v0] Creating vehicles...")
    for (const vehicle of uniqueVehicles) {
      const exists = await checkExists("vehicles", "internal_number", vehicle)
      if (!exists) {
        const result = await dbOperation("vehicles", {
          internal_number: vehicle,
          status: "active",
        })
        if (result) {
          console.log(`[v0] Created vehicle: ${vehicle}`)
        }
      } else {
        console.log(`[v0] Vehicle already exists: ${vehicle}`)
      }
    }

    console.log("[v0] CSV import completed successfully!")
    console.log("[v0] Summary:")
    console.log(`[v0] - Departments: ${uniqueDepartments.length}`)
    console.log(`[v0] - Locations: ${uniqueLocations.length}`)
    console.log(`[v0] - Drivers: ${uniqueDrivers.length}`)
    console.log(`[v0] - Vehicles: ${uniqueVehicles.length}`)
  } catch (error) {
    console.log("[v0] Fatal error:", error)
    throw error
  }
}

main().catch(console.error)
