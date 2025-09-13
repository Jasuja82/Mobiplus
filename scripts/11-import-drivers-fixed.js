import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log("[v0] Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importDriversFromCSV() {
  try {
    console.log("[v0] Starting driver import from CSV...")

    // Fetch the CSV data
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv"
    console.log("[v0] Fetching CSV from:", csvUrl)

    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, length:", csvText.length)

    // Parse CSV manually (simple approach)
    const lines = csvText.split("\n").filter((line) => line.trim())
    if (lines.length === 0) {
      throw new Error("CSV file is empty")
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("[v0] CSV Headers:", headers)

    // Show first few data rows to understand structure
    console.log("[v0] First 3 data rows:")
    for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
      const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""))
      console.log(`Row ${i}:`, row)
    }

    // Extract unique drivers from the data
    const drivers = new Set()
    const driverData = []

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""))
      if (row.length >= headers.length) {
        // Look for driver-related fields (adjust indices based on your CSV structure)
        const driverName = row[headers.indexOf("Driver")] || row[headers.indexOf("Condutor")] || row[1]
        const employeeNumber = row[headers.indexOf("Employee")] || row[headers.indexOf("Funcionario")] || row[0]

        if (driverName && !drivers.has(driverName)) {
          drivers.add(driverName)
          driverData.push({
            name: driverName,
            employee_number: employeeNumber,
            email: `${driverName.toLowerCase().replace(/\s+/g, ".")}@mobiazores.pt`,
          })
        }
      }
    }

    console.log("[v0] Found unique drivers:", driverData.length)
    driverData.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.name} (${driver.employee_number})`)
    })

    // Check existing users and drivers
    const { data: existingUsers } = await supabase.from("users").select("*")
    const { data: existingDrivers } = await supabase.from("drivers").select("*")

    console.log("[v0] Existing users in database:", existingUsers?.length || 0)
    console.log("[v0] Existing drivers in database:", existingDrivers?.length || 0)

    // Insert users first (if they don't exist)
    let insertedUsers = 0
    for (const driver of driverData) {
      const existingUser = existingUsers?.find((u) => u.email === driver.email)
      if (!existingUser) {
        const { data, error } = await supabase
          .from("users")
          .insert({
            email: driver.email,
            name: driver.name,
            role: "driver",
          })
          .select()

        if (error) {
          console.log("[v0] Error inserting user:", driver.name, error.message)
        } else {
          console.log("[v0] Inserted user:", driver.name)
          insertedUsers++
        }
      }
    }

    console.log("[v0] Users inserted:", insertedUsers)
    console.log("[v0] Driver import analysis complete!")
  } catch (error) {
    console.log("[v0] Error importing drivers:", error.message)
  }
}

importDriversFromCSV()
