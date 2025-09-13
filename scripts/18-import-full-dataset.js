console.log("[v0] Starting full dataset import...")

// Fetch and parse the full CSV dataset
async function importFullDataset() {
  try {
    console.log("[v0] Fetching full CSV dataset...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched successfully, size:", csvText.length, "characters")

    // Parse CSV with semicolon delimiter
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(";").map((h) => h.trim())

    console.log("[v0] Headers found:", headers)
    console.log("[v0] Total records to process:", lines.length - 1)

    // Process first 10 records as sample
    const sampleRecords = []
    for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
      const values = lines[i].split(";").map((v) => v.trim())

      if (values.length === headers.length) {
        const record = {
          vehicle_number: values[0] || "",
          license_plate: values[1] || "",
          date: values[2] || "",
          location_name: values[3] || "",
          location_number: values[4] || "",
          driver_name: values[5] || "",
          department_name: values[6] || "",
          odometer: Number.parseInt(values[7]) || 0,
          odometer_difference: values[8] === "" ? 0 : Number.parseInt(values[8]) || 0,
          liters: Number.parseFloat(values[9]) || 0,
          price_per_liter: Number.parseFloat(values[10]) || 0,
          total_cost: Number.parseFloat(values[11]) || 0,
          notes: values[12] || "",
        }

        sampleRecords.push(record)
      }
    }

    console.log("[v0] Sample records parsed:")
    sampleRecords.forEach((record, index) => {
      console.log(`Record ${index + 1}:`)
      console.log(`  Vehicle: ${record.vehicle_number} (${record.license_plate})`)
      console.log(`  Driver: ${record.driver_name}`)
      console.log(`  Location: ${record.location_name}`)
      console.log(`  Date: ${record.date}`)
      console.log(`  Odometer: ${record.odometer}`)
      console.log(`  Odometer Difference: ${record.odometer_difference}`)
      console.log(`  Liters: ${record.liters}`)
      console.log(`  Total Cost: ${record.total_cost}`)
      console.log("---")
    })

    // Analyze unique values for database population
    const uniqueVehicles = new Set()
    const uniqueDrivers = new Set()
    const uniqueLocations = new Set()
    const uniqueDepartments = new Set()

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(";").map((v) => v.trim())
      if (values.length === headers.length) {
        uniqueVehicles.add(`${values[0]}|${values[1]}`) // vehicle_number|license_plate
        uniqueDrivers.add(values[5]) // driver_name
        uniqueLocations.add(`${values[3]}|${values[4]}`) // location_name|location_number
        uniqueDepartments.add(values[6]) // department_name
      }
    }

    console.log("[v0] Dataset Analysis:")
    console.log(`  Total Records: ${lines.length - 1}`)
    console.log(`  Unique Vehicles: ${uniqueVehicles.size}`)
    console.log(`  Unique Drivers: ${uniqueDrivers.size}`)
    console.log(`  Unique Locations: ${uniqueLocations.size}`)
    console.log(`  Unique Departments: ${uniqueDepartments.size}`)

    console.log("[v0] Unique Vehicles:")
    Array.from(uniqueVehicles)
      .slice(0, 10)
      .forEach((vehicle) => {
        const [number, plate] = vehicle.split("|")
        console.log(`  Vehicle ${number}: ${plate}`)
      })

    console.log("[v0] Unique Drivers:")
    Array.from(uniqueDrivers)
      .slice(0, 10)
      .forEach((driver) => {
        console.log(`  ${driver}`)
      })

    console.log("[v0] Unique Locations:")
    Array.from(uniqueLocations)
      .slice(0, 10)
      .forEach((location) => {
        const [name, number] = location.split("|")
        console.log(`  ${name} (${number})`)
      })

    console.log("[v0] Unique Departments:")
    Array.from(uniqueDepartments).forEach((dept) => {
      console.log(`  ${dept}`)
    })

    console.log("[v0] Full dataset analysis complete!")
    console.log("[v0] Ready to proceed with database insertion using this structure.")
  } catch (error) {
    console.error("[v0] Error importing dataset:", error)
  }
}

// Run the import
importFullDataset()
