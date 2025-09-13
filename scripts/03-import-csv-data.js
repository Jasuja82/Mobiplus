// Script to import and process the CSV data into the database
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function importCsvData() {
  try {
    console.log("[v0] Starting CSV data import...")

    // Fetch the CSV data
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] Headers:", headers)
    console.log("[v0] Total data rows:", lines.length - 1)

    // Parse CSV data
    const csvData = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || null
      })
      csvData.push(row)
    }

    // Extract unique entities for master data
    const uniqueLocations = new Set()
    const uniqueFuelStations = new Set()
    const uniqueDepartments = new Set()
    const uniqueDrivers = new Set()
    const uniqueVehicles = new Set()

    csvData.forEach((row) => {
      if (row.Location) uniqueLocations.add(row.Location)
      if (row.FuelStation) uniqueFuelStations.add(row.FuelStation)
      if (row.Department) uniqueDepartments.add(row.Department)
      if (row.Driver) uniqueDrivers.add(row.Driver)
      if (row.Vehicle) uniqueVehicles.add(row.Vehicle)
    })

    console.log("[v0] Unique locations:", uniqueLocations.size)
    console.log("[v0] Unique fuel stations:", uniqueFuelStations.size)
    console.log("[v0] Unique departments:", uniqueDepartments.size)
    console.log("[v0] Unique drivers:", uniqueDrivers.size)
    console.log("[v0] Unique vehicles:", uniqueVehicles.size)

    // Insert locations
    const locationMap = new Map()
    for (const locationName of uniqueLocations) {
      if (locationName) {
        const { data, error } = await supabase
          .from("locations")
          .upsert(
            {
              name: locationName,
              city: locationName.includes("Azores") ? "Azores" : locationName,
              region: "Azores",
              country: "Portugal",
            },
            {
              onConflict: "name",
              ignoreDuplicates: false,
            },
          )
          .select()
          .single()

        if (error) {
          console.log("[v0] Location insert error:", error)
        } else {
          locationMap.set(locationName, data.id)
          console.log("[v0] Inserted location:", locationName)
        }
      }
    }

    // Insert departments with location references
    const departmentMap = new Map()
    for (const deptName of uniqueDepartments) {
      if (deptName) {
        // Try to find existing department first
        const { data: existingDept } = await supabase.from("departments").select("id").eq("name", deptName).single()

        if (!existingDept) {
          const { data, error } = await supabase
            .from("departments")
            .insert({
              name: deptName,
              description: `Department: ${deptName}`,
              budget: 50000, // Default budget
            })
            .select()
            .single()

          if (error) {
            console.log("[v0] Department insert error:", error)
          } else {
            departmentMap.set(deptName, data.id)
            console.log("[v0] Inserted department:", deptName)
          }
        } else {
          departmentMap.set(deptName, existingDept.id)
        }
      }
    }

    // Insert fuel stations
    const fuelStationMap = new Map()
    for (const stationName of uniqueFuelStations) {
      if (stationName) {
        const { data, error } = await supabase
          .from("fuel_stations")
          .upsert(
            {
              name: stationName,
              brand: stationName.split(" ")[0], // Use first word as brand
              address: stationName,
            },
            {
              onConflict: "name",
              ignoreDuplicates: false,
            },
          )
          .select()
          .single()

        if (error) {
          console.log("[v0] Fuel station insert error:", error)
        } else {
          fuelStationMap.set(stationName, data.id)
          console.log("[v0] Inserted fuel station:", stationName)
        }
      }
    }

    // Insert vehicles
    const vehicleMap = new Map()
    for (const vehicleName of uniqueVehicles) {
      if (vehicleName) {
        // Try to find existing vehicle first
        const { data: existingVehicle } = await supabase
          .from("vehicles")
          .select("id")
          .eq("license_plate", vehicleName)
          .single()

        if (!existingVehicle) {
          const { data, error } = await supabase
            .from("vehicles")
            .insert({
              license_plate: vehicleName,
              make: "Unknown",
              model: "Unknown",
              year: 2020,
              fuel_type: "gasoline",
              status: "active",
              current_mileage: 0,
            })
            .select()
            .single()

          if (error) {
            console.log("[v0] Vehicle insert error:", error)
          } else {
            vehicleMap.set(vehicleName, data.id)
            console.log("[v0] Inserted vehicle:", vehicleName)
          }
        } else {
          vehicleMap.set(vehicleName, existingVehicle.id)
        }
      }
    }

    // Insert drivers
    const driverMap = new Map()
    for (const driverName of uniqueDrivers) {
      if (driverName) {
        // Create user first
        const { data: userData, error: userError } = await supabase
          .from("users")
          .upsert(
            {
              name: driverName,
              email: `${driverName.toLowerCase().replace(/\s+/g, ".")}@mobiazores.pt`,
              role: "driver",
              is_active: true,
            },
            {
              onConflict: "email",
              ignoreDuplicates: false,
            },
          )
          .select()
          .single()

        if (userError) {
          console.log("[v0] User insert error:", userError)
          continue
        }

        // Create driver record
        const { data: driverData, error: driverError } = await supabase
          .from("drivers")
          .upsert(
            {
              user_id: userData.id,
              license_number: `LIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              is_active: true,
              license_categories: ["B"],
            },
            {
              onConflict: "user_id",
              ignoreDuplicates: false,
            },
          )
          .select()
          .single()

        if (driverError) {
          console.log("[v0] Driver insert error:", driverError)
        } else {
          driverMap.set(driverName, driverData.id)
          console.log("[v0] Inserted driver:", driverName)
        }
      }
    }

    // Insert refuel records
    let successCount = 0
    let errorCount = 0

    for (const row of csvData) {
      try {
        const refuelData = {
          vehicle_id: vehicleMap.get(row.Vehicle),
          driver_id: driverMap.get(row.Driver),
          fuel_station_id: fuelStationMap.get(row.FuelStation),
          location_id: locationMap.get(row.Location),
          refuel_date: new Date(row.Date || row.RefuelDate).toISOString(),
          liters: Number.parseFloat(row.Liters || row.Litres) || null,
          cost_per_liter: Number.parseFloat(row.CostPerLiter || row.PricePerLiter) || null,
          total_cost: Number.parseFloat(row.TotalCost || row.Cost) || null,
          odometer_reading: Number.parseInt(row.Odometer || row.Mileage) || null,
          fuel_station: row.FuelStation,
          receipt_number: row.ReceiptNumber || row.Receipt,
          notes: row.Notes || null,
        }

        // Skip if essential data is missing
        if (!refuelData.vehicle_id || !refuelData.refuel_date) {
          console.log("[v0] Skipping row due to missing essential data:", row)
          continue
        }

        const { error } = await supabase.from("refuel_records").insert(refuelData)

        if (error) {
          console.log("[v0] Refuel record insert error:", error, refuelData)
          errorCount++
        } else {
          successCount++
          if (successCount % 10 === 0) {
            console.log("[v0] Inserted", successCount, "refuel records...")
          }
        }
      } catch (err) {
        console.log("[v0] Error processing row:", err, row)
        errorCount++
      }
    }

    console.log("[v0] Import completed!")
    console.log("[v0] Successfully imported:", successCount, "refuel records")
    console.log("[v0] Errors:", errorCount)

    // Update vehicle current mileage based on latest refuel records
    console.log("[v0] Updating vehicle mileage...")
    for (const [vehicleName, vehicleId] of vehicleMap) {
      const { data: latestRefuel } = await supabase
        .from("refuel_records")
        .select("odometer_reading")
        .eq("vehicle_id", vehicleId)
        .not("odometer_reading", "is", null)
        .order("refuel_date", { ascending: false })
        .limit(1)
        .single()

      if (latestRefuel?.odometer_reading) {
        await supabase.from("vehicles").update({ current_mileage: latestRefuel.odometer_reading }).eq("id", vehicleId)

        console.log("[v0] Updated mileage for", vehicleName, "to", latestRefuel.odometer_reading)
      }
    }
  } catch (error) {
    console.error("[v0] Import failed:", error)
  }
}

importCsvData()
