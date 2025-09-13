console.log("[v0] Starting CSV data import...")

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[v0] Missing Supabase environment variables")
  throw new Error("Missing Supabase configuration")
}

// Simple Supabase client
const supabase = {
  async query(table, operation, data) {
    const url = `${supabaseUrl}/rest/v1/${table}`
    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }

    let fetchUrl = url
    const options = { headers }

    if (operation === "select") {
      fetchUrl += `?select=*`
      options.method = "GET"
    } else if (operation === "insert") {
      options.method = "POST"
      options.body = JSON.stringify(data)
    } else if (operation === "upsert") {
      fetchUrl += "?on_conflict=name"
      headers["Prefer"] = "resolution=merge-duplicates,return=representation"
      options.method = "POST"
      options.body = JSON.stringify(data)
    }

    const response = await fetch(fetchUrl, options)
    if (!response.ok) {
      const error = await response.text()
      console.error(`[v0] ${operation} failed:`, error)
      throw new Error(`${operation} failed: ${error}`)
    }
    return response.json()
  },
}

async function importCSVData() {
  try {
    console.log("[v0] Fetching CSV data...")

    // Fetch the full CSV file
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv"
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, size:", csvText.length)

    // Parse CSV (semicolon-delimited)
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(";").map((h) => h.trim())

    console.log("[v0] Headers found:", headers)
    console.log("[v0] Total records to process:", lines.length - 1)

    // Process first 10 records as a test
    const testRecords = lines.slice(1, 11)
    console.log("[v0] Processing first 10 records as test...")

    // Track unique values for lookup tables
    const uniqueDrivers = new Set()
    const uniqueVehicles = new Set()
    const uniqueLocations = new Set()
    const uniqueDepartments = new Set()

    // Parse test records
    const parsedRecords = []

    for (let i = 0; i < testRecords.length; i++) {
      const line = testRecords[i]
      const values = line.split(";").map((v) => v.trim())

      if (values.length !== headers.length) {
        console.log(`[v0] Skipping malformed record ${i + 1}: ${values.length} values vs ${headers.length} headers`)
        continue
      }

      // Map values to fields based on proven structure
      const record = {
        vehicle_internal_number: values[0] || "",
        vehicle_plate: values[1] || "",
        date: values[2] || "",
        location_name: values[3] || "",
        location_internal_number: values[4] || "",
        driver_name: values[5] || "",
        department_name: values[6] || "",
        odometer: Number.parseFloat(values[7]) || 0,
        calculated_odometer_difference: Number.parseFloat(values[8]) || 0,
        liters: Number.parseFloat(values[9]) || 0,
        price_liter: Number.parseFloat(values[10]) || 0,
        total_cost: Number.parseFloat(values[11]) || 0,
        notes: values[12] || "",
      }

      // Add to unique sets
      if (record.driver_name) uniqueDrivers.add(record.driver_name)
      if (record.vehicle_internal_number) uniqueVehicles.add(record.vehicle_internal_number)
      if (record.location_name) uniqueLocations.add(record.location_name)
      if (record.department_name) uniqueDepartments.add(record.department_name)

      parsedRecords.push(record)
    }

    console.log("[v0] Parsed records:", parsedRecords.length)
    console.log("[v0] Unique drivers:", uniqueDrivers.size)
    console.log("[v0] Unique vehicles:", uniqueVehicles.size)
    console.log("[v0] Unique locations:", uniqueLocations.size)
    console.log("[v0] Unique departments:", uniqueDepartments.size)

    // Show sample parsed record
    if (parsedRecords.length > 0) {
      console.log("[v0] Sample parsed record:", JSON.stringify(parsedRecords[0], null, 2))
    }

    // Create lookup tables
    console.log("[v0] Creating lookup tables...")

    // Create departments
    const departmentData = Array.from(uniqueDepartments).map((name) => ({ name }))
    if (departmentData.length > 0) {
      console.log("[v0] Inserting departments:", departmentData.length)
      await supabase.query("departments", "upsert", departmentData)
    }

    // Create locations
    const locationData = Array.from(uniqueLocations).map((name) => ({ name }))
    if (locationData.length > 0) {
      console.log("[v0] Inserting locations:", locationData.length)
      await supabase.query("locations", "upsert", locationData)
    }

    // Create drivers (simplified - just names for now)
    const driverData = Array.from(uniqueDrivers).map((name) => ({
      name,
      employee_number: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    }))
    if (driverData.length > 0) {
      console.log("[v0] Inserting drivers:", driverData.length)
      await supabase.query("drivers", "upsert", driverData)
    }

    // Create vehicles
    const vehicleData = Array.from(uniqueVehicles).map((internal_number) => {
      // Find corresponding plate from records
      const record = parsedRecords.find((r) => r.vehicle_internal_number === internal_number)
      return {
        internal_number,
        license_plate: record?.vehicle_plate || "",
        make: "Unknown",
        model: "Unknown",
        year: new Date().getFullYear(),
      }
    })
    if (vehicleData.length > 0) {
      console.log("[v0] Inserting vehicles:", vehicleData.length)
      await supabase.query("vehicles", "upsert", vehicleData)
    }

    console.log("[v0] Lookup tables created successfully!")
    console.log("[v0] Ready to insert refuel records...")

    // For now, just show we're ready - actual refuel insertion would be next step
    console.log("[v0] Test import completed successfully!")
    console.log("[v0] Next step: Insert actual refuel records with proper foreign key relationships")
  } catch (error) {
    console.error("[v0] Import failed:", error.message)
    throw error
  }
}

// Run the import
importCSVData()
