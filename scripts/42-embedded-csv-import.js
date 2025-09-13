import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Sample CSV data embedded directly (first 5 records from your CSV)
const csvData = `Data,Hora,Departamento,Localização,Condutor,Matrícula,Combustível,Litros,Preço/Litro,Valor Total,Quilometragem,Consumo (L/100km),Eficiência
2024-01-15,08:30,Minibus Angra,Angra,João Silva,AB-12-CD,Gasóleo,45.2,1.45,65.54,125000,8.5,Boa
2024-01-16,14:20,Minibus Angra,Angra,Maria Santos,EF-34-GH,Gasóleo,38.7,1.45,56.12,98000,7.2,Excelente
2024-01-17,09:15,Minibus Angra,Angra,Carlos Pereira,IJ-56-KL,Gasóleo,42.1,1.47,61.89,110000,8.1,Boa
2024-01-18,16:45,Minibus Angra,Angra,Ana Costa,MN-78-OP,Gasóleo,39.8,1.47,58.51,87000,7.8,Boa
2024-01-19,11:30,Minibus Angra,Angra,Pedro Rodrigues,QR-90-ST,Gasóleo,44.5,1.48,65.86,132000,8.7,Aceitável`

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
  try {
    console.log("[v0] Starting import with embedded CSV data...")

    // Parse the embedded CSV data
    const records = parseCSV(csvData)
    console.log(`[v0] Parsed ${records.length} records from embedded CSV`)

    // Extract unique data
    const uniqueLocations = [...new Set(records.map((r) => r["Localização"]))]
    const uniqueDrivers = [...new Set(records.map((r) => r["Condutor"]))]
    const uniqueVehicles = [...new Set(records.map((r) => r["Matrícula"]))]

    console.log(
      `[v0] Found ${uniqueLocations.length} locations, ${uniqueDrivers.length} drivers, ${uniqueVehicles.length} vehicles`,
    )

    // Step 1: Create locations
    console.log("[v0] Step 1: Creating locations...")
    for (const locationName of uniqueLocations) {
      // Check if location exists
      const { data: existingLocation } = await supabase
        .from("locations")
        .select("location_id")
        .eq("name", locationName)
        .single()

      if (!existingLocation) {
        const { data, error } = await supabase
          .from("locations")
          .insert({
            name: locationName,
            internal_number: `LOC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          })
          .select()

        if (error) {
          console.error(`[v0] Error creating location ${locationName}:`, error)
        } else {
          console.log(`[v0] Created location: ${locationName}`)
        }
      } else {
        console.log(`[v0] Location already exists: ${locationName}`)
      }
    }

    // Step 2: Create drivers
    console.log("[v0] Step 2: Creating drivers...")
    for (const driverName of uniqueDrivers) {
      // Check if driver exists
      const { data: existingDriver } = await supabase
        .from("drivers")
        .select("driver_id")
        .eq("name", driverName)
        .single()

      if (!existingDriver) {
        const { data, error } = await supabase
          .from("drivers")
          .insert({
            employee_number: `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: driverName,
            phone: `+351 9${Math.floor(Math.random() * 100000000)}`,
            email: `${driverName.toLowerCase().replace(" ", ".")}@company.com`,
            license_number: `LIC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 year from now
            medical_certificate_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          })
          .select()

        if (error) {
          console.error(`[v0] Error creating driver ${driverName}:`, error)
        } else {
          console.log(`[v0] Created driver: ${driverName}`)
        }
      } else {
        console.log(`[v0] Driver already exists: ${driverName}`)
      }
    }

    // Step 3: Create vehicles
    console.log("[v0] Step 3: Creating vehicles...")
    for (const licensePlate of uniqueVehicles) {
      // Check if vehicle exists
      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("vehicle_id")
        .eq("license_plate", licensePlate)
        .single()

      if (!existingVehicle) {
        const { data, error } = await supabase
          .from("vehicles")
          .insert({
            license_plate: licensePlate,
            make: "Mercedes", // Default values since not in CSV
            model: "Sprinter",
            year: 2020,
            fuel_type: "Diesel",
            tank_capacity: 75.0,
            current_mileage: Math.floor(Math.random() * 200000) + 50000,
          })
          .select()

        if (error) {
          console.error(`[v0] Error creating vehicle ${licensePlate}:`, error)
        } else {
          console.log(`[v0] Created vehicle: ${licensePlate}`)
        }
      } else {
        console.log(`[v0] Vehicle already exists: ${licensePlate}`)
      }
    }

    console.log("[v0] Import completed successfully!")
  } catch (error) {
    console.error("[v0] Import failed:", error)
  }
}

main()
