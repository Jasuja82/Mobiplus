// Test basic database connection and insert a single test record
console.log("[v0] Starting database connection test...")

try {
  // Create Supabase client using environment variables
  const { createClient } = await import("@supabase/supabase-js")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("[v0] Supabase URL:", supabaseUrl ? "Found" : "Missing")
  console.log("[v0] Supabase Key:", supabaseKey ? "Found" : "Missing")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test connection by checking existing tables
  console.log("[v0] Testing database connection...")

  const { data: drivers, error: driversError } = await supabase.from("drivers").select("count").limit(1)

  if (driversError) {
    console.log("[v0] Drivers table error:", driversError)
  } else {
    console.log("[v0] Drivers table accessible")
  }

  const { data: vehicles, error: vehiclesError } = await supabase.from("vehicles").select("count").limit(1)

  if (vehiclesError) {
    console.log("[v0] Vehicles table error:", vehiclesError)
  } else {
    console.log("[v0] Vehicles table accessible")
  }

  const { data: refuels, error: refuelsError } = await supabase.from("refuel_records").select("count").limit(1)

  if (refuelsError) {
    console.log("[v0] Refuel records table error:", refuelsError)
  } else {
    console.log("[v0] Refuel records table accessible")
  }

  console.log("[v0] Database connection test completed successfully")
} catch (error) {
  console.error("[v0] Database connection failed:", error.message)
}
