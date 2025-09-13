import { createClient } from "@supabase/supabase-js"

console.log("[v0] Starting final CSV import...")

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[v0] Missing Supabase environment variables")
  throw new Error("Missing Supabase configuration")
}

const supabase = createClient(supabaseUrl, supabaseKey)

// CSV URL
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"

async function main() {
  try {
    console.log("[v0] Fetching CSV data...")
    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    console.log(`[v0] CSV fetched successfully: ${csvText.length} characters`)

    // Parse CSV with semicolon delimiter
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(";")
    console.log(`[v0] Headers found: ${headers.join(", ")}`)

    // Process first 10 records as test
    const testRecords = lines.slice(1, 11)
    console.log(`[v0] Processing ${testRecords.length} test records...`)

    // Track unique values for lookup tables
    const uniqueDrivers = new Set()
    const uniqueVehicles = new Set()
    const uniqueLocations = new Set()
    const uniqueDepartments = new Set()

    // Parse records
    const parsedRecords = []

    for (let i = 0; i < testRecords.length; i++) {
      const line = testRecords[i]
      const values = line.split(";")

      if (values.length !== headers.length) {
        console.log(`[v0] Skipping malformed line ${i + 2}: ${line}`)
        continue
      }

      const record = {
        vehicleNumber: values[0]?.trim() || "",
        licensePlate: values[1]?.trim() || "",
        date: values[2]?.trim() || "",
        locationName: values[3]?.trim() || "",
        locationNumber: values[4]?.trim() || "",
        driverName: values[5]?.trim() || "",
        departmentName: values[6]?.trim() || "",
        odometer: Number.parseFloat(values[7]) || 0,
        odometerDifference: values[8]?.trim() === "" ? 0 : Number.parseFloat(values[8]) || 0,
        liters: Number.parseFloat(values[9]) || 0,
        pricePerLiter: Number.parseFloat(values[10]) || 0,
        totalCost: Number.parseFloat(values[11]) || 0,
        notes: values[12]?.trim() || "",
      }

      // Add to unique sets
      if (record.driverName) uniqueDrivers.add(record.driverName)
      if (record.vehicleNumber) uniqueVehicles.add(record.vehicleNumber)
      if (record.locationName) uniqueLocations.add(record.locationName)
      if (record.departmentName) uniqueDepartments.add(record.departmentName)

      parsedRecords.push(record)
    }

    console.log(`[v0] Parsed ${parsedRecords.length} records`)
    console.log(`[v0] Found ${uniqueDrivers.size} unique drivers`)
    console.log(`[v0] Found ${uniqueVehicles.size} unique vehicles`)
    console.log(`[v0] Found ${uniqueLocations.size} unique locations`)
    console.log(`[v0] Found ${uniqueDepartments.size} unique departments`)

    // Create departments
    console.log("[v0] Creating departments...")
    for (const deptName of uniqueDepartments) {
      try {
        const { data: existing } = await supabase.from("departments").select("id").eq("name", deptName).single()

        if (!existing) {
          const { error } = await supabase.from("departments").insert({ name: deptName })

          if (error) {
            console.error(`[v0] Error creating department ${deptName}:`, error)
          } else {
            console.log(`[v0] Created department: ${deptName}`)
          }
        }
      } catch (error) {
        console.error(`[v0] Error with department ${deptName}:`, error)
      }
    }

    // Create locations
    console.log("[v0] Creating locations...")
    for (const locationName of uniqueLocations) {
      try {
        const { data: existing } = await supabase.from("locations").select("id").eq("name", locationName).single()

        if (!existing) {
          const { error } = await supabase.from("locations").insert({
            name: locationName,
            internal_number: locationName, // Using name as internal number for now
          })

          if (error) {
            console.error(`[v0] Error creating location ${locationName}:`, error)
          } else {
            console.log(`[v0] Created location: ${locationName}`)
          }
        }
      } catch (error) {
        console.error(`[v0] Error with location ${locationName}:`, error)
      }
    }

    // Create users (drivers)
    console.log("[v0] Creating drivers...")
    for (const driverName of uniqueDrivers) {
      try {
        const { data: existing } = await supabase.from("users").select("id").eq("name", driverName).single()

        if (!existing) {
          const { error } = await supabase.from("users").insert({
            name: driverName,
            email: `${driverName.toLowerCase().replace(/\s+/g, ".")}@fleet.com`,
            role: "driver",
          })

          if (error) {
            console.error(`[v0] Error creating driver ${driverName}:`, error)
          } else {
            console.log(`[v0] Created driver: ${driverName}`)
          }
        }
      } catch (error) {
        console.error(`[v0] Error with driver ${driverName}:`, error)
      }
    }

    // Create vehicles
    console.log("[v0] Creating vehicles...")
    for (const vehicleNumber of uniqueVehicles) {
      try {
        const { data: existing } = await supabase
          .from("vehicles")
          .select("id")
          .eq("internal_number", vehicleNumber)
          .single()

        if (!existing) {
          // Find corresponding license plate from records
          const recordWithPlate = parsedRecords.find((r) => r.vehicleNumber === vehicleNumber)
          const licensePlate = recordWithPlate?.licensePlate || vehicleNumber

          const { error } = await supabase.from("vehicles").insert({
            internal_number: vehicleNumber,
            license_plate: licensePlate,
            make: "Unknown",
            model: "Unknown",
            year: new Date().getFullYear(),
          })

          if (error) {
            console.error(`[v0] Error creating vehicle ${vehicleNumber}:`, error)
          } else {
            console.log(`[v0] Created vehicle: ${vehicleNumber} (${licensePlate})`)
          }
        }
      } catch (error) {
        console.error(`[v0] Error with vehicle ${vehicleNumber}:`, error)
      }
    }

    console.log("[v0] Lookup tables created successfully!")
    console.log("[v0] Ready to import refuel records in next step.")
  } catch (error) {
    console.error("[v0] Fatal error:", error)
    throw error
  }
}

main().catch(console.error)
