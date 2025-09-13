// Comprehensive CSV import script with proper data normalization
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function comprehensiveImport() {
  try {
    console.log("[v0] Starting comprehensive CSV data import...")

    // Fetch the CSV data
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Refuel_human_readable-cEbSWfg1k2SCphKn3urmKjamAG6zp7.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV content preview:", csvText.substring(0, 500))

    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] Headers found:", headers)
    console.log("[v0] Total data rows:", lines.length - 1)

    // Parse CSV data with better handling
    const csvData = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || null
      })
      csvData.push(row)
    }

    console.log("[v0] Sample row:", csvData[0])

    const entities = {
      locations: new Map(),
      departments: new Map(),
      drivers: new Map(),
      vehicles: new Map(),
      fuelStations: new Map(),
      assignmentTypes: new Set(),
    }

    csvData.forEach((row, index) => {
      // Extract location data
      const locationName = row.Location || row.location || row.LOCATION
      if (locationName) {
        entities.locations.set(locationName, {
          name: locationName,
          internal_number: row.LocationCode || row.location_code || `LOC-${index + 1}`,
        })
      }

      // Extract department data
      const deptName = row.Department || row.department || row.DEPARTMENT
      if (deptName) {
        entities.departments.set(deptName, {
          name: deptName,
          description: `Department: ${deptName}`,
        })
      }

      // Extract driver data with employee numbers
      const driverName = row.Driver || row.driver || row.DRIVER
      const employeeNumber = row.EmployeeNumber || row.employee_number || row.EMPLOYEE_NUMBER
      if (driverName) {
        entities.drivers.set(driverName, {
          name: driverName,
          employee_number: employeeNumber || `EMP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        })
      }

      // Extract vehicle data with assignment types
      const vehicleId = row.Vehicle || row.vehicle || row.VEHICLE || row.VehicleNumber || row.vehicle_number
      const licensePlate = row.LicensePlate || row.license_plate || row.LICENSE_PLATE || vehicleId
      const assignmentType = row.Assignment || row.assignment || row.ASSIGNMENT || row.Type || row.type
      const vehicleNumber = row.VehicleNumber || row.vehicle_number || row.VEHICLE_NUMBER || vehicleId

      if (vehicleId) {
        entities.vehicles.set(vehicleId, {
          license_plate: licensePlate,
          vehicle_number: vehicleNumber,
          assignment_type: assignmentType,
          internal_number: row.InternalNumber || row.internal_number || `VEH-${index + 1}`,
        })

        if (assignmentType) {
          entities.assignmentTypes.add(assignmentType)
        }
      }

      // Extract fuel station data
      const fuelStation = row.FuelStation || row.fuel_station || row.FUEL_STATION
      if (fuelStation) {
        entities.fuelStations.set(fuelStation, {
          name: fuelStation,
          brand: fuelStation.split(" ")[0],
        })
      }
    })

    console.log("[v0] Extracted entities:")
    console.log("- Locations:", entities.locations.size)
    console.log("- Departments:", entities.departments.size)
    console.log("- Drivers:", entities.drivers.size)
    console.log("- Vehicles:", entities.vehicles.size)
    console.log("- Fuel Stations:", entities.fuelStations.size)
    console.log("- Assignment Types:", entities.assignmentTypes.size)

    const assignmentTypeMap = new Map()
    for (const typeName of entities.assignmentTypes) {
      if (typeName) {
        const { data, error } = await supabase
          .from("assignment_types")
          .upsert(
            { name: typeName, description: `${typeName} transportation services` },
            { onConflict: "name", ignoreDuplicates: false },
          )
          .select()
          .single()

        if (error) {
          console.log("[v0] Assignment type insert error:", error)
        } else {
          assignmentTypeMap.set(typeName, data.id)
          console.log("[v0] Inserted assignment type:", typeName)
        }
      }
    }

    const locationMap = new Map()
    for (const [locationName, locationData] of entities.locations) {
      const { data, error } = await supabase
        .from("locations")
        .upsert(
          {
            name: locationData.name,
            internal_number: locationData.internal_number,
            city: locationData.name.includes("Azores") ? "Azores" : locationData.name,
            region: "Azores",
            country: "Portugal",
          },
          { onConflict: "name", ignoreDuplicates: false },
        )
        .select()
        .single()

      if (error) {
        console.log("[v0] Location insert error:", error)
      } else {
        locationMap.set(locationName, data.id)
        console.log("[v0] Inserted location:", locationName, "with internal number:", locationData.internal_number)
      }
    }

    const departmentMap = new Map()
    for (const [deptName, deptData] of entities.departments) {
      const { data, error } = await supabase
        .from("departments")
        .upsert(
          {
            name: deptData.name,
            description: deptData.description,
            budget: 50000,
          },
          { onConflict: "name", ignoreDuplicates: false },
        )
        .select()
        .single()

      if (error) {
        console.log("[v0] Department insert error:", error)
      } else {
        departmentMap.set(deptName, data.id)
        console.log("[v0] Inserted department:", deptName)
      }
    }

    const fuelStationMap = new Map()
    for (const [stationName, stationData] of entities.fuelStations) {
      const { data, error } = await supabase
        .from("fuel_stations")
        .upsert(
          {
            name: stationData.name,
            brand: stationData.brand,
            address: stationData.name,
          },
          { onConflict: "name", ignoreDuplicates: false },
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

    const driverMap = new Map()
    for (const [driverName, driverData] of entities.drivers) {
      // Create user first with employee number
      const { data: userData, error: userError } = await supabase
        .from("users")
        .upsert(
          {
            name: driverData.name,
            employee_number: driverData.employee_number,
            email: `${driverData.name.toLowerCase().replace(/\s+/g, ".")}@mobiazores.pt`,
            role: "driver",
            is_active: true,
          },
          { onConflict: "email", ignoreDuplicates: false },
        )
        .select()
        .single()

      if (userError) {
        console.log("[v0] User insert error:", userError)
        continue
      }

      // Create driver record
      const { data: driverRecord, error: driverError } = await supabase
        .from("drivers")
        .upsert(
          {
            user_id: userData.id,
            license_number: `LIC-${driverData.employee_number}`,
            is_active: true,
            license_categories: ["B"],
          },
          { onConflict: "user_id", ignoreDuplicates: false },
        )
        .select()
        .single()

      if (driverError) {
        console.log("[v0] Driver insert error:", driverError)
      } else {
        driverMap.set(driverName, driverRecord.id)
        console.log("[v0] Inserted driver:", driverName, "with employee number:", driverData.employee_number)
      }
    }

    const vehicleMap = new Map()
    for (const [vehicleId, vehicleData] of entities.vehicles) {
      const { data, error } = await supabase
        .from("vehicles")
        .upsert(
          {
            license_plate: vehicleData.license_plate,
            vehicle_number: vehicleData.vehicle_number,
            internal_number: vehicleData.internal_number,
            assignment_type_id: assignmentTypeMap.get(vehicleData.assignment_type),
            make: "Unknown",
            model: "Unknown",
            year: 2020,
            fuel_type: "gasoline",
            status: "active",
            current_mileage: 0,
          },
          { onConflict: "license_plate", ignoreDuplicates: false },
        )
        .select()
        .single()

      if (error) {
        console.log("[v0] Vehicle insert error:", error)
      } else {
        vehicleMap.set(vehicleId, data.id)
        console.log("[v0] Inserted vehicle:", vehicleId, "with assignment:", vehicleData.assignment_type)
      }
    }

    let successCount = 0
    let errorCount = 0
    const vehicleOdometerHistory = new Map()

    // Sort CSV data by vehicle and date to calculate odometer differences
    csvData.sort((a, b) => {
      const vehicleA = a.Vehicle || a.vehicle || a.VEHICLE
      const vehicleB = b.Vehicle || b.vehicle || b.VEHICLE
      const dateA = new Date(a.Date || a.RefuelDate || a.refuel_date || a.DATE)
      const dateB = new Date(b.Date || b.RefuelDate || b.refuel_date || b.DATE)

      if (vehicleA !== vehicleB) return vehicleA.localeCompare(vehicleB)
      return dateA - dateB
    })

    for (const row of csvData) {
      try {
        const vehicleId = row.Vehicle || row.vehicle || row.VEHICLE
        const driverName = row.Driver || row.driver || row.DRIVER
        const fuelStation = row.FuelStation || row.fuel_station || row.FUEL_STATION
        const location = row.Location || row.location || row.LOCATION
        const refuelDate = row.Date || row.RefuelDate || row.refuel_date || row.DATE
        const liters = row.Liters || row.Litres || row.liters || row.LITERS
        const costPerLiter = row.CostPerLiter || row.PricePerLiter || row.cost_per_liter || row.COST_PER_LITER
        const totalCost = row.TotalCost || row.Cost || row.total_cost || row.TOTAL_COST
        const odometerReading = row.Odometer || row.Mileage || row.odometer || row.ODOMETER

        let odometerDifference = null
        const currentOdometer = Number.parseInt(odometerReading) || null

        if (currentOdometer && vehicleId) {
          const vehicleHistory = vehicleOdometerHistory.get(vehicleId) || []
          const lastOdometer = vehicleHistory.length > 0 ? vehicleHistory[vehicleHistory.length - 1] : null

          if (lastOdometer && currentOdometer > lastOdometer) {
            odometerDifference = currentOdometer - lastOdometer
          }

          vehicleHistory.push(currentOdometer)
          vehicleOdometerHistory.set(vehicleId, vehicleHistory)
        }

        const refuelData = {
          vehicle_id: vehicleMap.get(vehicleId),
          driver_id: driverMap.get(driverName),
          fuel_station_id: fuelStationMap.get(fuelStation),
          location_id: locationMap.get(location),
          refuel_date: new Date(refuelDate).toISOString(),
          liters: Number.parseFloat(liters) || null,
          cost_per_liter: Number.parseFloat(costPerLiter) || null,
          total_cost: Number.parseFloat(totalCost) || null,
          odometer_reading: currentOdometer,
          odometer_difference: odometerDifference, // Distance traveled since last refuel
          fuel_station: fuelStation,
          receipt_number: row.ReceiptNumber || row.Receipt || row.receipt_number,
          notes: row.Notes || row.notes || null,
        }

        // Skip if essential data is missing
        if (!refuelData.vehicle_id || !refuelData.refuel_date) {
          console.log("[v0] Skipping row due to missing essential data:", { vehicleId, refuelDate })
          continue
        }

        const { error } = await supabase.from("refuel_records").insert(refuelData)

        if (error) {
          console.log("[v0] Refuel record insert error:", error)
          errorCount++
        } else {
          successCount++
          if (successCount % 10 === 0) {
            console.log("[v0] Inserted", successCount, "refuel records...")
          }
        }
      } catch (err) {
        console.log("[v0] Error processing row:", err)
        errorCount++
      }
    }

    console.log("[v0] Updating vehicle current mileage from refuel data...")
    for (const [vehicleId, vehicleDbId] of vehicleMap) {
      const { data: latestRefuel } = await supabase
        .from("refuel_records")
        .select("odometer_reading")
        .eq("vehicle_id", vehicleDbId)
        .not("odometer_reading", "is", null)
        .order("refuel_date", { ascending: false })
        .limit(1)
        .single()

      if (latestRefuel?.odometer_reading) {
        await supabase.from("vehicles").update({ current_mileage: latestRefuel.odometer_reading }).eq("id", vehicleDbId)

        console.log("[v0] Updated mileage for", vehicleId, "to", latestRefuel.odometer_reading)
      }
    }

    console.log("[v0] Comprehensive import completed!")
    console.log("[v0] Successfully imported:", successCount, "refuel records")
    console.log("[v0] Errors:", errorCount)
    console.log("[v0] Locations:", entities.locations.size)
    console.log("[v0] Departments:", entities.departments.size)
    console.log("[v0] Drivers:", entities.drivers.size)
    console.log("[v0] Vehicles:", entities.vehicles.size)
    console.log("[v0] Assignment Types:", entities.assignmentTypes.size)
  } catch (error) {
    console.error("[v0] Comprehensive import failed:", error)
  }
}

// Helper function to properly parse CSV lines with quoted values
function parseCSVLine(line) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

comprehensiveImport()
