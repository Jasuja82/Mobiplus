import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Sample CSV data embedded directly
const csvData = `Employee Number,Name,Phone,Email,License Number,License Expiry,Medical Certificate Expiry,Department,Location,Vehicle License Plate,Vehicle Model,Vehicle Year,Fuel Type
001,João Silva,912345678,joao.silva@email.com,12345678,2025-12-31,2024-12-31,Minibus Angra,Angra,AA-11-BB,Mercedes Sprinter,2020,Diesel
002,Maria Santos,923456789,maria.santos@email.com,23456789,2026-01-15,2025-01-15,Minibus Angra,Angra,BB-22-CC,Ford Transit,2019,Diesel
003,Pedro Costa,934567890,pedro.costa@email.com,34567890,2025-06-30,2024-06-30,Minibus Angra,Angra,CC-33-DD,Volkswagen Crafter,2021,Diesel
004,Ana Ferreira,945678901,ana.ferreira@email.com,45678901,2026-03-15,2025-03-15,Minibus Angra,Angra,DD-44-EE,Mercedes Sprinter,2018,Diesel
005,Carlos Oliveira,956789012,carlos.oliveira@email.com,56789012,2025-09-30,2024-09-30,Minibus Angra,Angra,EE-55-FF,Ford Transit,2020,Diesel`

async function main() {
  console.log("[v0] Starting full schema import with RLS disabled...")

  try {
    // Parse CSV data
    console.log("[v0] Parsing CSV data...")
    const lines = csvData.trim().split("\n")
    const headers = lines[0].split(",")
    const records = lines.slice(1).map((line) => {
      const values = line.split(",")
      const record = {}
      headers.forEach((header, index) => {
        record[header.trim()] = values[index]?.trim() || ""
      })
      return record
    })

    console.log(`[v0] Parsed ${records.length} records`)

    // Step 1: Create/verify departments
    console.log("[v0] Step 1: Processing departments...")
    const departments = [...new Set(records.map((r) => r.Department))]

    for (const deptName of departments) {
      const { data: existingDept } = await supabase.from("departments").select("id").eq("name", deptName).single()

      if (!existingDept) {
        const { data, error } = await supabase
          .from("departments")
          .insert({
            name: deptName,
            budget: 50000,
            manager_name: "Fleet Manager",
          })
          .select()

        if (error) {
          console.log(`[v0] Error creating department ${deptName}:`, error)
        } else {
          console.log(`[v0] Created department: ${deptName}`)
        }
      } else {
        console.log(`[v0] Department already exists: ${deptName}`)
      }
    }

    // Step 2: Create/verify locations
    console.log("[v0] Step 2: Processing locations...")
    const locations = [...new Set(records.map((r) => r.Location))]

    for (const locationName of locations) {
      const { data: existingLocation } = await supabase.from("locations").select("id").eq("name", locationName).single()

      if (!existingLocation) {
        const { data, error } = await supabase
          .from("locations")
          .insert({
            name: locationName,
            address: `${locationName}, Azores`,
            latitude: 38.6605,
            longitude: -27.2208,
          })
          .select()

        if (error) {
          console.log(`[v0] Error creating location ${locationName}:`, error)
        } else {
          console.log(`[v0] Created location: ${locationName}`)
        }
      } else {
        console.log(`[v0] Location already exists: ${locationName}`)
      }
    }

    // Step 3: Create users and drivers
    console.log("[v0] Step 3: Processing users and drivers...")

    for (const record of records) {
      // Check if user already exists
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", record.Email).single()

      let userId

      if (!existingUser) {
        // Create user
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert({
            email: record.Email,
            full_name: record.Name,
            phone: record.Phone,
            role: "driver",
          })
          .select()
          .single()

        if (userError) {
          console.log(`[v0] Error creating user ${record.Name}:`, userError)
          continue
        }

        userId = newUser.id
        console.log(`[v0] Created user: ${record.Name}`)
      } else {
        userId = existingUser.id
        console.log(`[v0] User already exists: ${record.Name}`)
      }

      // Check if driver already exists
      const { data: existingDriver } = await supabase
        .from("drivers")
        .select("id")
        .eq("employee_number", record["Employee Number"])
        .single()

      if (!existingDriver) {
        // Create driver
        const { data: newDriver, error: driverError } = await supabase
          .from("drivers")
          .insert({
            user_id: userId,
            employee_number: record["Employee Number"],
            name: record.Name,
            phone: record.Phone,
            email: record.Email,
            license_number: record["License Number"],
            license_expiry: record["License Expiry"],
            medical_certificate_expiry: record["Medical Certificate Expiry"],
          })
          .select()

        if (driverError) {
          console.log(`[v0] Error creating driver ${record.Name}:`, driverError)
        } else {
          console.log(`[v0] Created driver: ${record.Name}`)
        }
      } else {
        console.log(`[v0] Driver already exists: ${record.Name}`)
      }
    }

    // Step 4: Create vehicles
    console.log("[v0] Step 4: Processing vehicles...")

    // Get department and location IDs for reference
    const { data: deptData } = await supabase.from("departments").select("id, name")
    const { data: locationData } = await supabase.from("locations").select("id, name")

    const deptMap = {}
    const locationMap = {}

    deptData?.forEach((dept) => {
      deptMap[dept.name] = dept.id
    })
    locationData?.forEach((loc) => {
      locationMap[loc.name] = loc.id
    })

    for (const record of records) {
      // Check if vehicle already exists
      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("id")
        .eq("license_plate", record["Vehicle License Plate"])
        .single()

      if (!existingVehicle) {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            license_plate: record["Vehicle License Plate"],
            make: record["Vehicle Model"].split(" ")[0], // First word as make
            model: record["Vehicle Model"],
            year: Number.parseInt(record["Vehicle Year"]),
            fuel_type: record["Fuel Type"].toLowerCase(),
            department_id: deptMap[record.Department],
            location_id: locationMap[record.Location],
            status: "active",
          })
          .select()

        if (vehicleError) {
          console.log(`[v0] Error creating vehicle ${record["Vehicle License Plate"]}:`, vehicleError)
        } else {
          console.log(`[v0] Created vehicle: ${record["Vehicle License Plate"]}`)
        }
      } else {
        console.log(`[v0] Vehicle already exists: ${record["Vehicle License Plate"]}`)
      }
    }

    console.log("[v0] Import completed successfully!")
  } catch (error) {
    console.log("[v0] Import failed:", error)
  }
}

main()
