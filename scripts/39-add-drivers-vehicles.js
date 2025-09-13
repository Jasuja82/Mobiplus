import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

console.log("[v0] Starting drivers and vehicles import...")

async function main() {
  try {
    // Step 1: Fetch CSV data
    console.log("[v0] Step 1: Fetching CSV data...")
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(";")

    console.log("[v0] CSV Headers:", headers)
    console.log("[v0] Total lines:", lines.length)

    // Process first 5 records for testing
    const records = []
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const values = lines[i].split(";")
      const record = {}
      headers.forEach((header, index) => {
        record[header.trim()] = values[index]?.trim() || ""
      })
      records.push(record)
    }

    console.log("[v0] Processing", records.length, "records")

    // Step 2: Extract unique drivers
    console.log("[v0] Step 2: Processing drivers...")
    const uniqueDrivers = [...new Set(records.map((r) => r["driver.name"]).filter(Boolean))]
    console.log("[v0] Unique drivers:", uniqueDrivers)

    // Create users and drivers
    const createdUserIds = {}

    for (const driverName of uniqueDrivers) {
      console.log("[v0] Processing driver:", driverName)

      // Check if user already exists
      const { data: existingUser } = await supabase.from("users").select("id").eq("name", driverName).single()

      let userId

      if (existingUser) {
        console.log("[v0] User exists:", driverName)
        userId = existingUser.id
      } else {
        // Create user first
        console.log("[v0] Creating user:", driverName)
        const userPayload = {
          id: crypto.randomUUID(),
          name: driverName,
          email: `${driverName.toLowerCase().replace(/\s+/g, ".")}@mobiazores.com`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert(userPayload)
          .select("id")
          .single()

        if (userError) {
          console.error("[v0] Error creating user:", userError)
          continue
        }

        userId = newUser.id
        console.log("[v0] User created successfully:", driverName)
      }

      createdUserIds[driverName] = userId

      // Check if driver already exists
      const { data: existingDriver } = await supabase.from("drivers").select("id").eq("user_id", userId).single()

      if (existingDriver) {
        console.log("[v0] Driver exists:", driverName)
      } else {
        // Create driver
        console.log("[v0] Creating driver:", driverName)
        const driverPayload = {
          id: crypto.randomUUID(),
          user_id: userId,
          license_number: `LIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: driverError } = await supabase.from("drivers").insert(driverPayload)

        if (driverError) {
          console.error("[v0] Error creating driver:", driverError)
        } else {
          console.log("[v0] Driver created successfully:", driverName)
        }
      }
    }

    // Step 3: Extract unique vehicles
    console.log("[v0] Step 3: Processing vehicles...")
    const uniqueVehicles = [
      ...new Set(
        records
          .map((r) => ({
            internal_number: r["vehicle.internal_number"],
            plate: r["vehicle.plate"],
          }))
          .filter((v) => v.internal_number && v.plate),
      ),
    ]

    console.log("[v0] Unique vehicles:", uniqueVehicles)

    for (const vehicle of uniqueVehicles) {
      console.log("[v0] Processing vehicle:", vehicle.internal_number, vehicle.plate)

      // Check if vehicle already exists
      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("id")
        .eq("internal_number", vehicle.internal_number)
        .single()

      if (existingVehicle) {
        console.log("[v0] Vehicle exists:", vehicle.internal_number)
      } else {
        // Create vehicle
        console.log("[v0] Creating vehicle:", vehicle.internal_number)
        const vehiclePayload = {
          id: crypto.randomUUID(),
          internal_number: vehicle.internal_number,
          plate: vehicle.plate,
          make: "Unknown",
          model: "Unknown",
          year: new Date().getFullYear(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: vehicleError } = await supabase.from("vehicles").insert(vehiclePayload)

        if (vehicleError) {
          console.error("[v0] Error creating vehicle:", vehicleError)
        } else {
          console.log("[v0] Vehicle created successfully:", vehicle.internal_number)
        }
      }
    }

    console.log("[v0] Drivers and vehicles import completed successfully!")
  } catch (error) {
    console.error("[v0] Import failed:", error)
  }
}

main()
