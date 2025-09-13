import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function debugUserCreation() {
  console.log("[v0] Starting user creation debug...")

  try {
    // First, let's check what fields the users table expects
    console.log("[v0] Checking users table structure...")

    // Try to create a minimal user record
    const testUser = {
      email: "test@example.com",
      name: "Test User",
      role: "driver",
    }

    console.log("[v0] Attempting to create user with data:", testUser)

    const { data, error } = await supabase.from("users").insert([testUser]).select()

    if (error) {
      console.log("[v0] User creation failed with error:", error)
      console.log("[v0] Error details:", JSON.stringify(error, null, 2))
    } else {
      console.log("[v0] User created successfully:", data)
    }

    // Let's also try to query existing users to see the structure
    console.log("[v0] Checking existing users structure...")
    const { data: existingUsers, error: queryError } = await supabase.from("users").select("*").limit(1)

    if (queryError) {
      console.log("[v0] Query error:", queryError)
    } else {
      console.log("[v0] Existing user structure:", existingUsers)
    }
  } catch (error) {
    console.log("[v0] Script error:", error)
  }
}

debugUserCreation()
