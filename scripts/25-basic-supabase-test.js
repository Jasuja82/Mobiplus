console.log("[v0] Starting basic Supabase test...")

try {
  // Test environment variables
  console.log("[v0] Testing environment variables...")
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  console.log("[v0] Supabase URL:", supabaseUrl ? "Found" : "Missing")
  console.log("[v0] Supabase Key:", supabaseKey ? "Found" : "Missing")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Test basic fetch to Supabase
  console.log("[v0] Testing basic Supabase connection...")

  const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
    method: "GET",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
  })

  console.log("[v0] Response status:", response.status)
  console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    const errorText = await response.text()
    console.log("[v0] Error response:", errorText)
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  console.log("[v0] Response data:", data)

  console.log("[v0] Basic Supabase test completed successfully!")
} catch (error) {
  console.log("[v0] ERROR in basic test:")
  console.log("[v0] Error name:", error.name)
  console.log("[v0] Error message:", error.message)
  console.log("[v0] Error stack:", error.stack)
}
