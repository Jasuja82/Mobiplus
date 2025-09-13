console.log("[v0] Starting detailed logging import...")

// CSV URL for test batch
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function main() {
  try {
    console.log("[v0] Fetching CSV data...")
    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(";")

    console.log("[v0] CSV Headers:", headers)
    console.log("[v0] Processing first 10 records...")

    // Process first 10 data records (skip header)
    const recordsToProcess = lines.slice(1, 11)

    // Track unique values for lookup tables
    const departments = new Set()
    const locations = new Set()
    const drivers = new Set()
    const vehicles = new Set()

    // Parse records and collect unique values
    const parsedRecords = []

    for (let i = 0; i < recordsToProcess.length; i++) {
      const values = recordsToProcess[i].split(";")

      const record = {
        vehicleNumber: values[0]?.trim() || "",
        licensePlate: values[1]?.trim() || "",
        date: values[2]?.trim() || "",
        locationName: values[3]?.trim() || "",
        locationNumber: values[4]?.trim() || "",
        driverName: values[5]?.trim() || "",
        departmentName: values[6]?.trim() || "",
        odometer: Number.parseFloat(values[7]) || 0,
        odometerDifference: Number.parseFloat(values[8]) || 0,
        liters: Number.parseFloat(values[9]) || 0,
        pricePerLiter: Number.parseFloat(values[10]) || 0,
        totalCost: Number.parseFloat(values[11]) || 0,
        notes: values[12]?.trim() || "",
      }

      // Collect unique values
      if (record.departmentName) departments.add(record.departmentName)
      if (record.locationName) locations.add(record.locationName)
      if (record.driverName) drivers.add(record.driverName)
      if (record.vehicleNumber && record.licensePlate) {
        vehicles.add(
          JSON.stringify({
            number: record.vehicleNumber,
            plate: record.licensePlate,
          }),
        )
      }

      parsedRecords.push(record)
    }

    console.log("[v0] Unique departments:", Array.from(departments))
    console.log("[v0] Unique locations:", Array.from(locations))
    console.log("[v0] Unique drivers:", Array.from(drivers))
    console.log("[v0] Unique vehicles:", vehicles.size)

    // Create departments
    console.log("[v0] Creating departments...")
    for (const deptName of departments) {
      console.log(`[v0] Processing department: ${deptName}`)

      const checkResponse = await fetch(`${supabaseUrl}/rest/v1/departments?name=eq.${encodeURIComponent(deptName)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
      })

      const existingDepts = await checkResponse.json()
      if (existingDepts.length > 0) {
        console.log("[v0] Department already exists:", deptName)
        continue
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          name: deptName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        console.log("[v0] Created department:", deptName)
      } else {
        const error = await response.text()
        console.log("[v0] Department creation error:", error)
      }
    }

    // Create locations
    console.log("[v0] Creating locations...")
    for (const locationName of locations) {
      console.log(`[v0] Processing location: ${locationName}`)

      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/locations?name=eq.${encodeURIComponent(locationName)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
          },
        },
      )

      const existingLocations = await checkResponse.json()
      if (existingLocations.length > 0) {
        console.log("[v0] Location already exists:", locationName)
        continue
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          name: locationName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        }),
      })

      if (response.ok) {
        console.log("[v0] Created location:", locationName)
      } else {
        const error = await response.text()
        console.log("[v0] Location creation error:", error)
      }
    }

    // Create drivers (users)
    console.log("[v0] Creating drivers...")
    const createdUsers = new Map() // Track created users for driver table

    for (const driverName of drivers) {
      console.log(`[v0] Processing driver: ${driverName}`)

      const email = `${driverName.toLowerCase().replace(/\s+/g, ".")}@fleet.local`
      console.log(`[v0] Generated email: ${email}`)

      console.log(`[v0] Checking if user exists for: ${driverName}`)
      const checkResponse = await fetch(`${supabaseUrl}/rest/v1/users?name=eq.${encodeURIComponent(driverName)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
      })

      console.log(`[v0] Check response status: ${checkResponse.status}`)
      const existingDrivers = await checkResponse.json()
      console.log(`[v0] Existing drivers found: ${existingDrivers.length}`)

      if (existingDrivers.length > 0) {
        console.log("[v0] Driver already exists:", driverName)
        createdUsers.set(driverName, existingDrivers[0].id) // Store existing user ID
        continue
      }

      const userId = crypto.randomUUID() // Generate user ID first
      console.log(`[v0] Generated user ID: ${userId}`)

      const userPayload = {
        id: userId,
        email: email,
        name: driverName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      }
      console.log(`[v0] User payload:`, userPayload)

      console.log(`[v0] Creating user for: ${driverName}`)
      const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify(userPayload),
      })

      console.log(`[v0] User creation response status: ${response.status}`)

      if (response.ok) {
        console.log("[v0] Created user:", driverName)
        createdUsers.set(driverName, userId) // Store created user ID
      } else {
        const error = await response.text()
        console.log("[v0] User creation error:", error)
        console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))
      }
    }

    console.log("[v0] Creating driver records...")
    console.log(`[v0] Created users map size: ${createdUsers.size}`)

    for (const driverName of drivers) {
      console.log(`[v0] Processing driver record for: ${driverName}`)

      const userId = createdUsers.get(driverName)
      console.log(`[v0] User ID for ${driverName}: ${userId}`)

      if (!userId) {
        console.log("[v0] Skipping driver record - no user ID for:", driverName)
        continue
      }

      console.log(`[v0] Checking if driver record exists for user ID: ${userId}`)
      const checkResponse = await fetch(`${supabaseUrl}/rest/v1/drivers?user_id=eq.${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
      })

      console.log(`[v0] Driver check response status: ${checkResponse.status}`)
      const existingDriverRecords = await checkResponse.json()
      console.log(`[v0] Existing driver records: ${existingDriverRecords.length}`)

      if (existingDriverRecords.length > 0) {
        console.log("[v0] Driver record already exists for:", driverName)
        continue
      }

      const driverPayload = {
        id: crypto.randomUUID(),
        user_id: userId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      console.log(`[v0] Driver payload:`, driverPayload)

      console.log(`[v0] Creating driver record for: ${driverName}`)
      const response = await fetch(`${supabaseUrl}/rest/v1/drivers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify(driverPayload),
      })

      console.log(`[v0] Driver creation response status: ${response.status}`)

      if (response.ok) {
        console.log("[v0] Created driver record for:", driverName)
      } else {
        const error = await response.text()
        console.log("[v0] Driver record creation error:", error)
        console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))
      }
    }

    // Create vehicles
    console.log("[v0] Creating vehicles...")
    for (const vehicleJson of vehicles) {
      const vehicle = JSON.parse(vehicleJson)
      console.log(`[v0] Processing vehicle: ${vehicle.number} - ${vehicle.plate}`)

      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/vehicles?internal_number=eq.${encodeURIComponent(vehicle.number)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
          },
        },
      )

      const existingVehicles = await checkResponse.json()
      if (existingVehicles.length > 0) {
        console.log("[v0] Vehicle already exists:", vehicle.number, vehicle.plate)
        continue
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          internal_number: vehicle.number,
          license_plate: vehicle.plate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        console.log("[v0] Created vehicle:", vehicle.number, vehicle.plate)
      } else {
        const error = await response.text()
        console.log("[v0] Vehicle creation error:", error)
      }
    }

    console.log("[v0] Import completed successfully!")
    console.log("[v0] Created:", {
      departments: departments.size,
      locations: locations.size,
      drivers: drivers.size,
      vehicles: vehicles.size,
    })
  } catch (error) {
    console.error("[v0] Fatal error:", error)
    console.error("[v0] Stack trace:", error.stack)
  }
}

main()
