import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  try {
    console.log("[v0] Starting step-by-step import...")

    // Step 1: Fetch and parse CSV
    console.log("[v0] Step 1: Fetching CSV data...")
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test%20batch%20for%20parsing-TR2wxjuge3CH7BjLCj7xLRiw3dKLtS.csv"
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(";").map((h) => h.trim())

    console.log("[v0] CSV Headers:", headers)
    console.log("[v0] Total lines:", lines.length)

    // Process first 5 records for testing
    const records = lines.slice(1, 6).map((line) => {
      const values = line.split(";").map((v) => v.trim())
      const record = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })
      return record
    })

    console.log("[v0] Processing", records.length, "records")

    // Step 2: Extract unique departments
    console.log("[v0] Step 2: Processing departments...")
    const uniqueDepartments = [...new Set(records.map((r) => r["department.name"]).filter(Boolean))]
    console.log("[v0] Unique departments:", uniqueDepartments)

    for (const deptName of uniqueDepartments) {
      console.log("[v0] Checking department:", deptName)

      const { data: existing } = await supabase.from("departments").select("id").eq("name", deptName).single()

      if (existing) {
        console.log("[v0] Department exists:", deptName)
      } else {
        console.log("[v0] Creating department:", deptName)
        const { error } = await supabase.from("departments").insert({
          id: crypto.randomUUID(),
          name: deptName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.error("[v0] Department creation error:", error)
        } else {
          console.log("[v0] Department created successfully:", deptName)
        }
      }
    }

    // Step 3: Extract unique locations
    console.log("[v0] Step 3: Processing locations...")
    const uniqueLocations = [...new Set(records.map((r) => r["location.name"]).filter(Boolean))]
    console.log("[v0] Unique locations:", uniqueLocations)

    for (const locationName of uniqueLocations) {
      console.log("[v0] Checking location:", locationName)

      const { data: existing } = await supabase.from("locations").select("id").eq("name", locationName).single()

      if (existing) {
        console.log("[v0] Location exists:", locationName)
      } else {
        console.log("[v0] Creating location:", locationName)
        const { error } = await supabase.from("locations").insert({
          id: crypto.randomUUID(),
          name: locationName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.error("[v0] Location creation error:", error)
        } else {
          console.log("[v0] Location created successfully:", locationName)
        }
      }
    }

    console.log("[v0] Step-by-step import completed successfully!")
  } catch (error) {
    console.error("[v0] Fatal error:", error)
    throw error
  }
}

main()
