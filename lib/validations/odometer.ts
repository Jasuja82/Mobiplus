import { createClient } from "@/lib/supabase/client"

export interface OdometerValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  suggestions: string[]
  lastKnownReading?: number
  lastRefuelDate?: string
  estimatedReading?: number
}

export interface RefuelRecord {
  id: string
  vehicle_id: string
  refuel_date: string
  odometer_reading: number
  liters: number
  odometer_difference?: number
}

export class OdometerValidator {
  private supabase = createClient()

  /**
   * Validates odometer reading for a vehicle
   */
  async validateOdometerReading(
    vehicleId: string,
    newReading: number,
    refuelDate: string,
    excludeRecordId?: string,
  ): Promise<OdometerValidationResult> {
    const result: OdometerValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: [],
    }

    try {
      // Get vehicle's current mileage
      const { data: vehicle } = await this.supabase
        .from("vehicles")
        .select("current_mileage, license_plate")
        .eq("id", vehicleId)
        .single()

      if (!vehicle) {
        result.isValid = false
        result.errors.push("Veículo não encontrado")
        return result
      }

      // Get recent refuel records for this vehicle (last 10 records)
      let query = this.supabase
        .from("refuel_records")
        .select("id, refuel_date, odometer_reading, liters, odometer_difference")
        .eq("vehicle_id", vehicleId)
        .order("refuel_date", { ascending: false })
        .order("odometer_reading", { ascending: false })
        .limit(10)

      if (excludeRecordId) {
        query = query.neq("id", excludeRecordId)
      }

      const { data: recentRecords } = await query

      // Basic validations
      if (newReading < 0) {
        result.isValid = false
        result.errors.push("A quilometragem não pode ser negativa")
      }

      if (newReading > 9999999) {
        result.isValid = false
        result.errors.push("Quilometragem parece excessivamente alta")
      }

      // Get the most recent record before this date
      const recordsBeforeDate = recentRecords?.filter((r) => new Date(r.refuel_date) <= new Date(refuelDate)) || []

      const lastRecord = recordsBeforeDate[0]

      if (lastRecord) {
        result.lastKnownReading = lastRecord.odometer_reading
        result.lastRefuelDate = lastRecord.refuel_date

        // Check for negative progression
        if (newReading < lastRecord.odometer_reading) {
          const difference = lastRecord.odometer_reading - newReading
          if (difference > 100) {
            result.isValid = false
            result.errors.push(
              `Quilometragem inferior ao último registo (${lastRecord.odometer_reading.toLocaleString()} km). ` +
                `Diferença: -${difference.toLocaleString()} km`,
            )
          } else {
            result.warnings.push(
              `Quilometragem ligeiramente inferior ao último registo. ` +
                `Verifique se está correto: ${newReading.toLocaleString()} km vs ${lastRecord.odometer_reading.toLocaleString()} km`,
            )
          }
        }

        // Check for unusually high jumps
        const kmDifference = newReading - lastRecord.odometer_reading
        const daysDifference = Math.abs(
          (new Date(refuelDate).getTime() - new Date(lastRecord.refuel_date).getTime()) / (1000 * 60 * 60 * 24),
        )

        if (kmDifference > 1500) {
          result.warnings.push(
            `Aumento de quilometragem muito elevado: +${kmDifference.toLocaleString()} km ` +
              `em ${Math.round(daysDifference)} dias (${Math.round(kmDifference / Math.max(daysDifference, 1))} km/dia)`,
          )
        }

        if (daysDifference > 0 && kmDifference / daysDifference > 500) {
          result.warnings.push(`Média diária muito alta: ${Math.round(kmDifference / daysDifference)} km/dia`)
        }

        // Estimate expected reading based on time elapsed
        if (daysDifference > 0) {
          const avgDailyKm = this.calculateAverageDaily(recentRecords || [])
          result.estimatedReading = Math.round(lastRecord.odometer_reading + avgDailyKm * daysDifference)

          if (Math.abs(newReading - result.estimatedReading) > 300) {
            result.suggestions.push(
              `Com base no histórico, esperava-se cerca de ${result.estimatedReading.toLocaleString()} km ` +
                `(média de ${Math.round(avgDailyKm)} km/dia)`,
            )
          }
        }
      }

      // Check against vehicle's current mileage
      if (vehicle.current_mileage && newReading < vehicle.current_mileage - 1000) {
        result.warnings.push(
          `Quilometragem muito abaixo da quilometragem atual do veículo (${vehicle.current_mileage.toLocaleString()} km)`,
        )
      }

      // Check for records after this date that would create inconsistencies
      const recordsAfterDate = recentRecords?.filter((r) => new Date(r.refuel_date) > new Date(refuelDate)) || []

      for (const futureRecord of recordsAfterDate) {
        if (newReading > futureRecord.odometer_reading) {
          result.warnings.push(
            `Esta quilometragem é superior a um registo posterior (${futureRecord.odometer_reading.toLocaleString()} km ` +
              `em ${new Date(futureRecord.refuel_date).toLocaleDateString()})`,
          )
        }
      }

      // Additional suggestions
      if (result.warnings.length === 0 && result.errors.length === 0) {
        result.suggestions.push("Quilometragem parece consistente com o histórico")
      }
    } catch (error) {
      console.error("Error validating odometer:", error)
      result.warnings.push("Não foi possível validar completamente a quilometragem")
    }

    return result
  }

  /**
   * Calculate average daily kilometers based on recent records
   */
  private calculateAverageDaily(records: RefuelRecord[]): number {
    if (records.length < 2) return 100 // Default assumption

    const validRecords = records.filter((r) => r.odometer_difference && r.odometer_difference > 0).slice(0, 5) // Use last 5 valid records

    if (validRecords.length === 0) return 100

    // Calculate average km per day based on differences and time spans
    let totalKm = 0
    let totalDays = 0

    for (let i = 0; i < validRecords.length - 1; i++) {
      const current = validRecords[i]
      const previous = validRecords[i + 1]

      const kmDiff = current.odometer_reading - previous.odometer_reading
      const daysDiff = Math.abs(
        (new Date(current.refuel_date).getTime() - new Date(previous.refuel_date).getTime()) / (1000 * 60 * 60 * 24),
      )

      if (daysDiff > 0 && kmDiff > 0 && kmDiff < 2000) {
        // Reasonable values only
        totalKm += kmDiff
        totalDays += daysDiff
      }
    }

    return totalDays > 0 ? totalKm / totalDays : 100
  }

  /**
   * Get the last known odometer reading for a vehicle
   */
  async getLastOdometerReading(vehicleId: string): Promise<{
    reading: number | null
    date: string | null
    recordId: string | null
  }> {
    try {
      const { data } = await this.supabase
        .from("refuel_records")
        .select("id, odometer_reading, refuel_date")
        .eq("vehicle_id", vehicleId)
        .order("refuel_date", { ascending: false })
        .order("odometer_reading", { ascending: false })
        .limit(1)
        .single()

      return {
        reading: data?.odometer_reading || null,
        date: data?.refuel_date || null,
        recordId: data?.id || null,
      }
    } catch {
      return { reading: null, date: null, recordId: null }
    }
  }

  /**
   * Sanitize database by fixing odometer inconsistencies
   */
  async sanitizeOdometerData(vehicleId?: string): Promise<{
    fixed: number
    warnings: string[]
  }> {
    const result = { fixed: 0, warnings: [] }

    try {
      let query = this.supabase
        .from("refuel_records")
        .select("*")
        .order("vehicle_id")
        .order("refuel_date")
        .order("odometer_reading")

      if (vehicleId) {
        query = query.eq("vehicle_id", vehicleId)
      }

      const { data: records } = await query

      if (!records) return result

      // Group by vehicle
      const vehicleGroups = records.reduce(
        (acc, record) => {
          if (!acc[record.vehicle_id]) acc[record.vehicle_id] = []
          acc[record.vehicle_id].push(record)
          return acc
        },
        {} as Record<string, typeof records>,
      )

      // Process each vehicle
      for (const [vId, vehicleRecords] of Object.entries(vehicleGroups)) {
        // Sort by date, then by odometer
        vehicleRecords.sort((a, b) => {
          const dateCompare = new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
          if (dateCompare !== 0) return dateCompare
          return a.odometer_reading - b.odometer_reading
        })

        // Calculate odometer differences
        for (let i = 0; i < vehicleRecords.length; i++) {
          const current = vehicleRecords[i]
          const previous = i > 0 ? vehicleRecords[i - 1] : null

          let odometerDifference = 0
          if (previous) {
            odometerDifference = current.odometer_reading - previous.odometer_reading
          }

          // Update if different
          if (current.odometer_difference !== odometerDifference) {
            await this.supabase
              .from("refuel_records")
              .update({ odometer_difference: odometerDifference })
              .eq("id", current.id)

            result.fixed++
          }

          // Flag suspicious records
          if (odometerDifference < 0) {
            result.warnings.push(`Registo ${current.id}: quilometragem negativa (${odometerDifference} km)`)
          }
          if (odometerDifference > 2000) {
            result.warnings.push(`Registo ${current.id}: salto muito grande (${odometerDifference} km)`)
          }
        }
      }
    } catch (error) {
      console.error("Error sanitizing odometer data:", error)
      result.warnings.push("Erro durante a sanitização dos dados")
    }

    return result
  }
}

// Export singleton instance
export const odometerValidator = new OdometerValidator()
