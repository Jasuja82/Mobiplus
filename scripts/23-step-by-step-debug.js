console.log("[v0] === STEP-BY-STEP DEBUG SCRIPT ===")

try {
  console.log("[v0] Step 1: Testing basic JavaScript execution")
  const testVar = "Hello World"
  console.log("[v0] Basic JS works:", testVar)

  console.log("[v0] Step 2: Testing environment variables")
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  console.log("[v0] Supabase URL exists:", !!supabaseUrl)
  console.log("[v0] Supabase Key exists:", !!supabaseKey)

  console.log("[v0] Step 3: Testing fetch capability")
  const csvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv"

  fetch(csvUrl)
    .then((response) => {
      console.log("[v0] Fetch response status:", response.status)
      console.log("[v0] Fetch response ok:", response.ok)
      return response.text()
    })
    .then((csvText) => {
      console.log("[v0] CSV text length:", csvText.length)
      console.log("[v0] First 200 characters:", csvText.substring(0, 200))

      console.log("[v0] Step 4: Testing CSV parsing")
      const lines = csvText.split("\n")
      console.log("[v0] Total lines:", lines.length)
      console.log("[v0] First line (headers):", lines[0])
      console.log("[v0] Second line (first data):", lines[1])

      console.log("[v0] Step 5: Testing semicolon split")
      const headers = lines[0].split(";")
      console.log("[v0] Headers count:", headers.length)
      console.log("[v0] Headers:", headers)

      console.log("[v0] === ALL STEPS COMPLETED SUCCESSFULLY ===")
    })
    .catch((error) => {
      console.error("[v0] Error in fetch/parsing:", error)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    })
} catch (error) {
  console.error("[v0] Error in main execution:", error)
  console.error("[v0] Error message:", error.message)
  console.error("[v0] Error stack:", error.stack)
}

console.log("[v0] Script execution completed")
