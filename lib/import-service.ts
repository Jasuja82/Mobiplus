import type { CSVData, ColumnMapping, ValidationFlag, ImportResult, ParsedRecord, DatabaseField } from "@/types"
import { DATABASE_FIELDS } from "@/types"
import { createClient } from "@/lib/supabase/client"

export class ImportService {
  private supabase = createClient()

  async parseCSV(file: File): Promise<CSVData> {
    const text = await file.text()
    const lines = text.split("\n").filter(line => line.trim())

    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row")
    }

    // Handle both comma and semicolon delimited files
    const delimiter = lines[0].includes(';') ? ';' : ','
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ""))
    const rows = lines.slice(1).map(line => 
      line.split(delimiter).map(cell => cell.trim().replace(/"/g, ""))
    )

    // Validate that all rows have the same number of columns as headers
    const invalidRows = rows.filter(row => row.length !== headers.length)
    if (invalidRows.length > 0) {
      throw new Error(`Found ${invalidRows.length} rows with incorrect number of columns`)
    }

    return {
      headers,
      rows,
      fileName: file.name,
      fileSize: file.size
    }
  }

  autoMapColumns(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {}

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase()

      // Auto-mapping patterns
      if (lowerHeader.includes("interno") || lowerHeader.includes("internal") || lowerHeader.includes("number")) {
        mapping[header] = "vehicle.internal_number"
      } else if (lowerHeader.includes("matrícula") || lowerHeader.includes("plate") || lowerHeader.includes("matricula")) {
        mapping[header] = "vehicle.license_plate"
      } else if (lowerHeader.includes("data") || lowerHeader.includes("date")) {
        mapping[header] = "refuel.date"
      } else if (lowerHeader.includes("litros") || lowerHeader.includes("liters") || lowerHeader.includes("litres")) {
        mapping[header] = "refuel.liters"
      } else if (lowerHeader.includes("km") || lowerHeader.includes("odometer") || lowerHeader.includes("quilometragem")) {
        mapping[header] = "refuel.odometer_reading"
      } else if (lowerHeader.includes("condutor") || lowerHeader.includes("driver")) {
        mapping[header] = "driver.name"
      } else if (lowerHeader.includes("departamento") || lowerHeader.includes("department")) {
        mapping[header] = "department.name"
      } else if (lowerHeader.includes("local") || lowerHeader.includes("location") || lowerHeader.includes("localização")) {
        mapping[header] = "location.name"
      } else if (lowerHeader.includes("preço") || lowerHeader.includes("price") || lowerHeader.includes("cost")) {
        mapping[header] = "refuel.cost_per_liter"
      } else if (lowerHeader.includes("notas") || lowerHeader.includes("notes") || lowerHeader.includes("observações")) {
        mapping[header] = "refuel.notes"
      }
    })

    return mapping
  }

  validateRecord(row: string[], headers: string[], columnMapping: ColumnMapping, rowIndex: number): ValidationFlag[] {
    const flags: ValidationFlag[] = []

    headers.forEach((header, colIndex) => {
      const dbField = columnMapping[header]
      const value = row[colIndex]

      if (!dbField) return

      const fieldDef = DATABASE_FIELDS.find(f => f.id === dbField)
      if (!fieldDef) return

      // Required field validation
      if (fieldDef.required && (!value || value.trim() === "")) {
        flags.push({
          type: "required_field",
          severity: "error",
          message: `${fieldDef.label} is required`,
          suggestion: `Provide a value for ${fieldDef.label}`
        })
        return
      }

      if (!value || value.trim() === "") return

      // Type-specific validation
      switch (fieldDef.type) {
        case "number":
          const numValue = Number(value)
          if (isNaN(numValue)) {
            flags.push({
              type: "invalid_number",
              severity: "error",
              message: `${fieldDef.label} must be a valid number`,
              suggestion: `Correct the value "${value}" to a valid number`
            })
          } else if (fieldDef.validation) {
            if (fieldDef.validation.min !== undefined && numValue < fieldDef.validation.min) {
              flags.push({
                type: "number_too_small",
                severity: "error",
                message: `${fieldDef.label} must be at least ${fieldDef.validation.min}`,
                suggestion: `Change "${value}" to a value >= ${fieldDef.validation.min}`
              })
            }
            if (fieldDef.validation.max !== undefined && numValue > fieldDef.validation.max) {
              flags.push({
                type: "number_too_large",
                severity: "error",
                message: `${fieldDef.label} must be at most ${fieldDef.validation.max}`,
                suggestion: `Change "${value}" to a value <= ${fieldDef.validation.max}`
              })
            }
          }
          break

        case "date":
          const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/
          if (!dateRegex.test(value)) {
            flags.push({
              type: "invalid_date",
              severity: "error",
              message: `${fieldDef.label} has invalid date format`,
              suggestion: "Use YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY format"
            })
          }
          break
      }
    })

    return flags
  }

  async validateData(csvData: CSVData, columnMapping: ColumnMapping): Promise<{ records: ParsedRecord[], errors: ValidationFlag[] }> {
    const records: ParsedRecord[] = []
    const allErrors: ValidationFlag[] = []

    for (let i = 0; i < csvData.rows.length; i++) {
      const row = csvData.rows[i]
      const flags = this.validateRecord(row, csvData.headers, columnMapping, i + 1)
      
      const record: ParsedRecord = {
        rowIndex: i + 1,
        isValid: flags.filter(f => f.severity === "error").length === 0,
        flags
      }

      // Map CSV values to database fields
      csvData.headers.forEach((header, colIndex) => {
        const dbField = columnMapping[header]
        if (dbField) {
          record[dbField] = row[colIndex]
        }
      })

      records.push(record)
      allErrors.push(...flags)
    }

    return { records, errors: allErrors }
  }

  async importRecords(records: ParsedRecord[], columnMapping: ColumnMapping): Promise<ImportResult> {
    const startTime = Date.now()
    let successfulImports = 0
    let errors = 0
    const validationErrors: any[] = []
    const createdRecords = {
      vehicles: 0,
      drivers: 0,
      refuelRecords: 0,
      locations: 0,
      departments: 0
    }

    // Filter out records with errors
    const validRecords = records.filter(record => record.isValid)

    try {
      // Create lookup tables first
      await this.createLookupTables(validRecords)

      // Import refuel records
      for (const record of validRecords) {
        try {
          await this.importRefuelRecord(record)
          successfulImports++
          createdRecords.refuelRecords++
        } catch (error) {
          console.error("Error importing record:", error)
          errors++
          validationErrors.push({
            row: record.rowIndex,
            error: error instanceof Error ? error.message : "Unknown error"
          })
        }
      }

      const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`

      return {
        totalRows: records.length,
        successfulImports,
        errors,
        warnings: records.filter(r => r.flags?.some(f => f.severity === "warning")).length,
        duration,
        createdRecords,
        validationErrors
      }
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private async createLookupTables(records: ParsedRecord[]): Promise<void> {
    // Extract unique values for lookup tables
    const uniqueDepartments = new Set<string>()
    const uniqueLocations = new Set<string>()
    const uniqueDrivers = new Set<string>()
    const uniqueVehicles = new Set<string>()

    records.forEach(record => {
      if (record["department.name"]) uniqueDepartments.add(record["department.name"])
      if (record["location.name"]) uniqueLocations.add(record["location.name"])
      if (record["driver.name"]) uniqueDrivers.add(record["driver.name"])
      if (record["vehicle.internal_number"]) uniqueVehicles.add(record["vehicle.internal_number"])
    })

    // Create departments
    for (const deptName of uniqueDepartments) {
      const { data: existing } = await this.supabase
        .from("departments")
        .select("id")
        .eq("name", deptName)
        .single()

      if (!existing) {
        await this.supabase.from("departments").insert({
          name: deptName,
          description: `Imported department: ${deptName}`
        })
      }
    }

    // Create locations
    for (const locationName of uniqueLocations) {
      const { data: existing } = await this.supabase
        .from("locations")
        .select("id")
        .eq("name", locationName)
        .single()

      if (!existing) {
        await this.supabase.from("locations").insert({
          name: locationName,
          is_active: true
        })
      }
    }

    // Create users/drivers
    for (const driverName of uniqueDrivers) {
      const email = `${driverName.toLowerCase().replace(/\s+/g, ".")}@imported.local`
      
      const { data: existingUser } = await this.supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single()

      if (!existingUser) {
        const { data: newUser } = await this.supabase.from("users").insert({
          email,
          name: driverName,
          role: "driver",
          department: "Imported"
        }).select().single()

        if (newUser) {
          await this.supabase.from("drivers").insert({
            user_id: newUser.id,
            license_number: `LIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            medical_certificate_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            is_active: true
          })
        }
      }
    }

    // Create vehicles
    for (const vehicleNumber of uniqueVehicles) {
      const { data: existing } = await this.supabase
        .from("vehicles")
        .select("id")
        .eq("license_plate", vehicleNumber)
        .single()

      if (!existing) {
        await this.supabase.from("vehicles").insert({
          license_plate: vehicleNumber,
          make: "Unknown",
          model: "Unknown",
          year: new Date().getFullYear(),
          fuel_type: "diesel",
          status: "active",
          current_mileage: 0
        })
      }
    }
  }

  private async importRefuelRecord(record: ParsedRecord): Promise<void> {
    // Get foreign key IDs
    const vehicleId = await this.getVehicleId(record["vehicle.license_plate"] || record["vehicle.internal_number"])
    const driverId = record["driver.name"] ? await this.getDriverId(record["driver.name"]) : null
    const locationId = record["location.name"] ? await this.getLocationId(record["location.name"]) : null

    if (!vehicleId) {
      throw new Error("Vehicle not found")
    }

    // Parse and format data
    const refuelDate = this.parseDate(record["refuel.date"])
    const liters = Number(record["refuel.liters"])
    const costPerLiter = Number(record["refuel.cost_per_liter"] || 1.45) // Default price
    const mileage = Number(record["refuel.odometer_reading"])

    const { error } = await this.supabase.from("refuel_records").insert({
      vehicle_id: vehicleId,
      driver_id: driverId,
      refuel_date: refuelDate,
      mileage,
      liters,
      cost_per_liter: costPerLiter,
      total_cost: liters * costPerLiter,
      fuel_station: record["location.name"] || null,
      notes: record["refuel.notes"] || null
    })

    if (error) {
      throw error
    }
  }

  private async getVehicleId(identifier: string): Promise<string | null> {
    const { data } = await this.supabase
      .from("vehicles")
      .select("id")
      .or(`license_plate.eq.${identifier},internal_number.eq.${identifier}`)
      .single()

    return data?.id || null
  }

  private async getDriverId(name: string): Promise<string | null> {
    const { data } = await this.supabase
      .from("drivers")
      .select("id, user:users(name)")
      .eq("users.name", name)
      .single()

    return data?.id || null
  }

  private async getLocationId(name: string): Promise<string | null> {
    const { data } = await this.supabase
      .from("locations")
      .select("id")
      .eq("name", name)
      .single()

    return data?.id || null
  }

  private parseDate(dateString: string): string {
    // Handle various date formats
    if (!dateString) return new Date().toISOString()

    // Try different date formats
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ]

    for (const format of formats) {
      if (format.test(dateString)) {
        let date: Date

        if (dateString.includes('/')) {
          const [day, month, year] = dateString.split('/')
          date = new Date(Number(year), Number(month) - 1, Number(day))
        } else if (dateString.includes('-') && dateString.length === 10) {
          if (dateString.startsWith('20')) {
            // YYYY-MM-DD
            date = new Date(dateString)
          } else {
            // DD-MM-YYYY
            const [day, month, year] = dateString.split('-')
            date = new Date(Number(year), Number(month) - 1, Number(day))
          }
        } else {
          date = new Date(dateString)
        }

        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      }
    }

    // If no format matches, try to parse as-is
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }

    throw new Error(`Invalid date format: ${dateString}`)
  }
}

export const importService = new ImportService()