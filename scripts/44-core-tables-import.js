import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Sample CSV data embedded directly
const csvData = `employee_number,name,phone,email,license_number,license_expiry,medical_certificate_expiry,department_name,location,license_plate,vehicle_model,vehicle_year,fuel_type,odometer_reading
001,João Silva,912345678,joao.silva@email.com,12345678,2025-12-31,2024-06-30,Minibus Angra,Angra,AA-11-BB,Mercedes Sprinter,2020,Diesel,45000
002,Maria Santos,923456789,maria.santos@email.com,23456789,2026-01-15,2024-07-15,Minibus Angra,Angra,BB-22-CC,Ford Transit,2019,Diesel,52000
003,Pedro Costa,934567890,pedro.costa@email.com,34567890,2025-11-20,2024-08-20,Minibus Angra,Angra,CC-33-DD,Volkswagen Crafter,2021,Diesel,38000
004,Ana Ferreira,945678901,ana.ferreira@email.com,45678901,2026-03-10,2024-09-10,Minibus Angra,Angra,DD-44-EE,Mercedes Sprinter,2018,Diesel,67000
005,Carlos Oliveira,956789012,carlos.oliveira@email.com,56789012,2025-09-05,2024-10-05,Minibus Angra,Angra,EE-55-FF,Ford Transit,2020,Diesel,41000`

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",")

  return lines.slice(1).map((line) => {
    const values = line.split(",")
    const record = {}
    headers.forEach((header, index) => {
      record[header.trim()] = values[index]?.trim() || ""
    })
    return record
  })
}

async function main() {
  console.log("[v0] Starting core tables import...")

  try {
    // Parse CSV data
    const records = parseCSV(csvData)
    console.log(`[v0] Parsed ${records.length} records from CSV`)

    // Extract unique values
    const uniqueDepartments = [...new Set(records.map((r) => r.department_name))]
    const uniqueLocations = [...new Set(records.map((r) => r.location))]
    const uniqueDrivers = [...new Set(records.map((r) => r.employee_number))]
    const uniqueVehicles = [...new Set(records.map((r) => r.license_plate))]

    console.log(
      `[v0] Found: ${uniqueDepartments.length} departments, ${uniqueLocations.length} locations, ${uniqueDrivers.length} drivers, ${uniqueVehicles.length} vehicles`,
    )

    // Step 1: Create assignment_types (departments)
    console.log("[v0] Step 1: Processing assignment_types...")
    for (const deptName of uniqueDepartments) {
      const { data: existing } = await supabase.from("assignment_types").select("id").eq("name", deptName).single()

      if (!existing) {
        const { data, error } = await supabase
          .from("assignment_types")
          .insert({
            name: deptName,
            description: `Department: ${deptName}`,
          })
          .select()

        if (error) {
          console.log(`[v0] Error creating assignment_type ${deptName}:`, error.message)
        } else {
          console.log(`[v0] Created assignment_type: ${deptName}`)
        }
      } else {
        console.log(`[v0] Assignment_type already exists: ${deptName}`)
      }
    }

    // Step 2: Create fuel_stations (locations)
    console.log("[v0] Step 2: Processing fuel_stations...")
    for (const location of uniqueLocations) {
      const { data: existing } = await supabase.from("fuel_stations").select("id").eq("name", location).single()

      if (!existing) {
        const { data, error } = await supabase
          .from("fuel_stations")
          .insert({
            name: location,
            address: `${location}, Azores`,
            latitude: 38.6605, // Default Azores coordinates
            longitude: -27.2208,
          })
          .select()

        if (error) {
          console.log(`[v0] Error creating fuel_station ${location}:`, error.message)
        } else {
          console.log(`[v0] Created fuel_station: ${location}`)
        }
      } else {
        console.log(`[v0] Fuel_station already exists: ${location}`)
      }
    }

    // Step 3: Create users first (required for drivers)
    console.log("[v0] Step 3: Processing users...")
    const userIds = {}

    for (const record of records) {
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", record.email).single()

      if (!existingUser) {
        const { data, error } = await supabase
          .from("users")
          .insert({
            email: record.email,
            full_name: record.name,
            phone: record.phone,
            role: "driver",
          })
          .select()

        if (error) {
          console.log(`[v0] Error creating user ${record.email}:`, error.message)
        } else {
          userIds[record.employee_number] = data[0].id
          console.log(`[v0] Created user: ${record.name}`)
        }
      } else {
        userIds[record.employee_number] = existingUser.id
        console.log(`[v0] User already exists: ${record.name}`)
      }
    }

    // Step 4: Create drivers
    console.log("[v0] Step 4: Processing drivers...")
    for (const record of records) {
      const { data: existing } = await supabase
        .from("drivers")
        .select("id")
        .eq("employee_number", record.employee_number)
        .single()

      if (!existing && userIds[record.employee_number]) {
        const { data, error } = await supabase
          .from("drivers")
          .insert({
            user_id: userIds[record.employee_number],
            employee_number: record.employee_number,
            license_number: record.license_number,
            license_expiry: record.license_expiry,
            medical_certificate_expiry: record.medical_certificate_expiry,
          })
          .select()

        if (error) {
          console.log(`[v0] Error creating driver ${record.employee_number}:`, error.message)
        } else {
          console.log(`[v0] Created driver: ${record.name} (${record.employee_number})`)
        }
      } else {
        console.log(`[v0] Driver already exists or user missing: ${record.employee_number}`)
      }
    }

    // Step 5: Create vehicles
    console.log("[v0] Step 5: Processing vehicles...")
    for (const record of records) {
      const { data: existing } = await supabase
        .from("vehicles")
        .select("id")
        .eq("license_plate", record.license_plate)
        .single()

      if (!existing) {
        const { data, error } = await supabase
          .from("vehicles")
          .insert({
            license_plate: record.license_plate,
            make: record.vehicle_model.split(" ")[0], // Extract make from model
            model: record.vehicle_model,
            year: Number.parseInt(record.vehicle_year),
            fuel_type: record.fuel_type.toLowerCase(),
            odometer_reading: Number.parseInt(record.odometer_reading),
            status: "active",
          })
          .select()

        if (error) {
          console.log(`[v0] Error creating vehicle ${record.license_plate}:`, error.message)
        } else {
          console.log(`[v0] Created vehicle: ${record.license_plate} (${record.vehicle_model})`)
        }
      } else {
        console.log(`[v0] Vehicle already exists: ${record.license_plate}`)
      }
    }

    console.log("[v0] Core tables import completed successfully!")
  } catch (error) {
    console.log("[v0] Import failed:", error.message)
  }
}

main()
