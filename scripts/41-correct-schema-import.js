console.log("[v0] Starting import with correct schema...")

async function main() {
  try {
    // Step 1: Fetch CSV data
    console.log("[v0] Step 1: Fetching CSV data...")
    const csvUrl =
      "https://blob.vercel-storage.com/test-batch-10-records-mobiazores-fleet-data-YjQxNzM2YzYtMzE4Zi00YWE4LWI4YzMtNzQ5ZGY4ZGY4ZGY4-KjQxNzM2YzYtMzE4Zi00YWE4LWI4YzMtNzQ5ZGY4ZGY4ZGY4.csv"

    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, length:", csvText.length)

    // Step 2: Parse CSV
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("[v0] Headers:", headers)

    const records = []
    for (let i = 1; i < Math.min(6, lines.length); i++) {
      // Process first 5 records
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      const record = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })
      records.push(record)
    }

    console.log("[v0] Processing", records.length, "records")

    // Step 3: Extract unique data
    const uniqueLocations = [...new Set(records.map((r) => r.Localização).filter(Boolean))]
    const uniqueDrivers = [...new Set(records.map((r) => r.Condutor).filter(Boolean))]
    const uniqueVehicles = records
      .filter((r) => r["Nº Viatura"])
      .map((r) => ({
        number: r["Nº Viatura"],
        plate: r.Matrícula,
        description: r.Descrição || "",
        location: r.Localização,
      }))

    console.log(
      "[v0] Found:",
      uniqueLocations.length,
      "locations,",
      uniqueDrivers.length,
      "drivers,",
      uniqueVehicles.length,
      "vehicles",
    )

    // Step 4: Create locations
    console.log("[v0] Step 4: Creating locations...")
    for (const locationName of uniqueLocations) {
      try {
        // Check if location exists
        const checkResponse = await fetch("/api/supabase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: "SELECT location_id FROM locations WHERE name = $1",
            params: [locationName],
          }),
        })

        const checkResult = await checkResponse.json()

        if (checkResult.data && checkResult.data.length === 0) {
          // Location doesn't exist, create it
          const insertResponse = await fetch("/api/supabase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: "INSERT INTO locations (name, status) VALUES ($1, $2) RETURNING location_id",
              params: [locationName, "active"],
            }),
          })

          const insertResult = await insertResponse.json()
          if (insertResult.error) {
            console.log("[v0] Error creating location:", insertResult.error)
          } else {
            console.log("[v0] Created location:", locationName)
          }
        } else {
          console.log("[v0] Location already exists:", locationName)
        }
      } catch (error) {
        console.log("[v0] Error processing location:", locationName, error.message)
      }
    }

    // Step 5: Create drivers
    console.log("[v0] Step 5: Creating drivers...")
    for (const driverName of uniqueDrivers) {
      try {
        // Check if driver exists
        const checkResponse = await fetch("/api/supabase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: "SELECT id FROM drivers WHERE name = $1",
            params: [driverName],
          }),
        })

        const checkResult = await checkResponse.json()

        if (checkResult.data && checkResult.data.length === 0) {
          // Driver doesn't exist, create it
          const insertResponse = await fetch("/api/supabase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: "INSERT INTO drivers (name, status) VALUES ($1, $2) RETURNING id",
              params: [driverName, "active"],
            }),
          })

          const insertResult = await insertResponse.json()
          if (insertResult.error) {
            console.log("[v0] Error creating driver:", insertResult.error)
          } else {
            console.log("[v0] Created driver:", driverName)
          }
        } else {
          console.log("[v0] Driver already exists:", driverName)
        }
      } catch (error) {
        console.log("[v0] Error processing driver:", driverName, error.message)
      }
    }

    // Step 6: Create vehicles
    console.log("[v0] Step 6: Creating vehicles...")
    for (const vehicle of uniqueVehicles) {
      try {
        // Check if vehicle exists
        const checkResponse = await fetch("/api/supabase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: "SELECT id FROM vehicles WHERE license_plate = $1",
            params: [vehicle.plate],
          }),
        })

        const checkResult = await checkResponse.json()

        if (checkResult.data && checkResult.data.length === 0) {
          // Vehicle doesn't exist, create it
          const insertResponse = await fetch("/api/supabase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query:
                "INSERT INTO vehicles (vehicle_number, license_plate, description, status) VALUES ($1, $2, $3, $4) RETURNING id",
              params: [Number.parseInt(vehicle.number) || null, vehicle.plate, vehicle.description, "active"],
            }),
          })

          const insertResult = await insertResponse.json()
          if (insertResult.error) {
            console.log("[v0] Error creating vehicle:", insertResult.error)
          } else {
            console.log("[v0] Created vehicle:", vehicle.plate)
          }
        } else {
          console.log("[v0] Vehicle already exists:", vehicle.plate)
        }
      } catch (error) {
        console.log("[v0] Error processing vehicle:", vehicle.plate, error.message)
      }
    }

    console.log("[v0] Import completed successfully!")
  } catch (error) {
    console.log("[v0] Import failed:", error)
  }
}

main()
