import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  console.log("[v0] Starting test drivers and vehicles creation...")

  try {
    // Test data - sample drivers and vehicles
    const testDrivers = [
      { name: "João Silva", license: "ABC123" },
      { name: "Maria Santos", license: "DEF456" },
      { name: "Pedro Costa", license: "GHI789" },
    ]

    const testVehicles = [
      { plate: "AA-11-BB", model: "Mercedes Sprinter", year: 2020 },
      { plate: "CC-22-DD", model: "Iveco Daily", year: 2019 },
    ]

    console.log("[v0] Step 1: Creating test users and drivers...")

    const createdUserIds = []

    for (const driver of testDrivers) {
      console.log(`[v0] Creating user for driver: ${driver.name}`)

      // Create user first
      const userId = crypto.randomUUID()
      const userEmail = `${driver.name.toLowerCase().replace(" ", ".")}@mobiazores.com`

      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: userEmail,
          name: driver.name,
          role: "driver",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (userError) {
        console.log(`[v0] User creation error:`, userError)
        continue
      }

      console.log(`[v0] User created successfully: ${userId}`)
      createdUserIds.push(userId)

      // Create corresponding driver
      console.log(`[v0] Creating driver record for: ${driver.name}`)

      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          license_number: driver.license,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (driverError) {
        console.log(`[v0] Driver creation error:`, driverError)
      } else {
        console.log(`[v0] Driver created successfully`)
      }
    }

    console.log("[v0] Step 2: Creating test vehicles...")

    for (const vehicle of testVehicles) {
      console.log(`[v0] Creating vehicle: ${vehicle.plate}`)

      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          id: crypto.randomUUID(),
          plate: vehicle.plate,
          model: vehicle.model,
          year: vehicle.year,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (vehicleError) {
        console.log(`[v0] Vehicle creation error:`, vehicleError)
      } else {
        console.log(`[v0] Vehicle created successfully: ${vehicle.plate}`)
      }
    }

    console.log("[v0] Test data creation completed successfully!")
    console.log(`[v0] Created ${createdUserIds.length} users/drivers and ${testVehicles.length} vehicles`)
  } catch (error) {
    console.error("[v0] Test script failed:", error)
  }
}

main()
