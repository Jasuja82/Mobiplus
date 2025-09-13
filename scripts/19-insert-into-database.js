import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertFleetData() {
  try {
    console.log("Fetching CSV data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )
    const csvText = await response.text()

    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(";")
    const dataRows = lines.slice(1)

    console.log(`Processing ${dataRows.length} records...`)

    // Extract unique data for lookup tables
    const uniqueDrivers = new Set()
    const uniqueVehicles = new Set()
    const uniqueLocations = new Set()
    const uniqueDepartments = new Set()

    const parsedRecords = []

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(";")

      const record = {
        vehicleNumber: row[0]?.trim() || "",
        licensePlate: row[1]?.trim() || "",
        date: row[2]?.trim() || "",
        locationName: row[3]?.trim() || "",
        locationNumber: row[4]?.trim() || "",
        driverName: row[5]?.trim() || "",
        departmentName: row[6]?.trim() || "",
        odometer: Number.parseFloat(row[7]) || 0,
        odometerDifference: Number.parseFloat(row[8]) || 0,
        liters: Number.parseFloat(row[9]) || 0,
        pricePerLiter: Number.parseFloat(row[10]) || 0,
        totalCost: Number.parseFloat(row[11]) || 0,
        notes: row[12]?.trim() || "",
      }

      uniqueDrivers.add(record.driverName)
      uniqueVehicles.add(`${record.vehicleNumber}|${record.licensePlate}`)
      uniqueLocations.add(`${record.locationName}|${record.locationNumber}`)
      uniqueDepartments.add(record.departmentName)

      parsedRecords.push(record)
    }

    console.log(`Found ${uniqueDrivers.size} unique drivers`)
    console.log(`Found ${uniqueVehicles.size} unique vehicles`)
    console.log(`Found ${uniqueLocations.size} unique locations`)
    console.log(`Found ${uniqueDepartments.size} unique departments`)

    // Insert departments first
    console.log("Inserting departments...")
    const departmentInserts = Array.from(uniqueDepartments).map((name) => ({
      name: name,
      description: `Department: ${name}`,
    }))

    const { data: departments, error: deptError } = await supabase
      .from("departments")
      .upsert(departmentInserts, { onConflict: "name" })
      .select()

    if (deptError) {
      console.error("Department insert error:", deptError)
      return
    }

    // Insert locations
    console.log("Inserting locations...")
    const locationInserts = Array.from(uniqueLocations).map((loc) => {
      const [name, number] = loc.split("|")
      return {
        name: name,
        internal_number: number,
        address: name,
      }
    })

    const { data: locations, error: locError } = await supabase
      .from("locations")
      .upsert(locationInserts, { onConflict: "name" })
      .select()

    if (locError) {
      console.error("Location insert error:", locError)
      return
    }

    // Insert assignment types
    console.log("Inserting assignment types...")
    const assignmentInserts = Array.from(uniqueDepartments).map((name) => ({
      name: name,
      description: `Assignment type: ${name}`,
    }))

    const { data: assignments, error: assignError } = await supabase
      .from("assignment_types")
      .upsert(assignmentInserts, { onConflict: "name" })
      .select()

    if (assignError) {
      console.error("Assignment insert error:", assignError)
      return
    }

    // Insert users/drivers
    console.log("Inserting drivers...")
    const driverInserts = Array.from(uniqueDrivers).map((name) => ({
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@mobiazores.pt`,
      full_name: name,
      role: "driver",
    }))

    const { data: users, error: userError } = await supabase
      .from("users")
      .upsert(driverInserts, { onConflict: "email" })
      .select()

    if (userError) {
      console.error("User insert error:", userError)
      return
    }

    // Insert vehicles
    console.log("Inserting vehicles...")
    const vehicleInserts = Array.from(uniqueVehicles).map((veh) => {
      const [number, plate] = veh.split("|")
      const assignmentType = assignments.find((a) => a.name === "Interurbana") // Default assignment
      return {
        internal_number: number,
        license_plate: plate,
        assignment_type_id: assignmentType?.id,
        current_mileage: 0, // Will be updated with latest odometer reading
        status: "active",
      }
    })

    const { data: vehicles, error: vehError } = await supabase
      .from("vehicles")
      .upsert(vehicleInserts, { onConflict: "license_plate" })
      .select()

    if (vehError) {
      console.error("Vehicle insert error:", vehError)
      return
    }

    // Insert refuel records in batches
    console.log("Inserting refuel records...")
    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < parsedRecords.length; i += batchSize) {
      const batch = parsedRecords.slice(i, i + batchSize)

      const refuelInserts = batch
        .map((record) => {
          const vehicle = vehicles.find((v) => v.license_plate === record.licensePlate)
          const driver = users.find((u) => u.full_name === record.driverName)
          const location = locations.find((l) => l.name === record.locationName)

          // Convert Excel date serial number to proper date
          let refuelDate = new Date()
          if (record.date && !isNaN(record.date)) {
            // Excel date serial number conversion
            const excelEpoch = new Date(1900, 0, 1)
            refuelDate = new Date(excelEpoch.getTime() + (Number.parseInt(record.date) - 2) * 24 * 60 * 60 * 1000)
          }

          return {
            vehicle_id: vehicle?.id,
            driver_id: driver?.id,
            location_id: location?.id,
            refuel_date: refuelDate.toISOString().split("T")[0],
            odometer_reading: record.odometer,
            odometer_difference: record.odometerDifference,
            liters: record.liters,
            price_per_liter: record.pricePerLiter,
            total_cost: record.totalCost,
            notes: record.notes,
            // Calculated fields
            fuel_efficiency: record.odometerDifference > 0 ? (record.liters / record.odometerDifference) * 100 : 0,
            cost_per_km: record.odometerDifference > 0 ? record.totalCost / record.odometerDifference : 0,
            km_per_liter: record.liters > 0 ? record.odometerDifference / record.liters : 0,
          }
        })
        .filter((record) => record.vehicle_id && record.driver_id && record.location_id)

      if (refuelInserts.length > 0) {
        const { error: refuelError } = await supabase.from("refuel_records").insert(refuelInserts)

        if (refuelError) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, refuelError)
        } else {
          insertedCount += refuelInserts.length
          console.log(
            `Inserted batch ${Math.floor(i / batchSize) + 1}: ${refuelInserts.length} records (Total: ${insertedCount})`,
          )
        }
      }

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`\n✅ Import completed!`)
    console.log(`📊 Total refuel records inserted: ${insertedCount}`)
    console.log(`🚗 Vehicles: ${vehicles.length}`)
    console.log(`👥 Drivers: ${users.length}`)
    console.log(`📍 Locations: ${locations.length}`)
    console.log(`🏢 Departments: ${departments.length}`)
  } catch (error) {
    console.error("Import failed:", error)
  }
}

insertFleetData()
