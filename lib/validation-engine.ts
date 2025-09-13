export interface ValidationRule {
  name: string
  type: "error" | "warning"
  check: (record: any, context: any) => boolean
  message: (record: any, context: any) => string
  suggestion?: (record: any, context: any) => string
}

export interface ValidationFlag {
  type: string
  severity: "error" | "warning"
  message: string
  suggestion?: string
}

export class FleetValidationEngine {
  private rules: ValidationRule[] = []
  private vehicleStats: Map<string, any> = new Map()

  constructor() {
    this.initializeRules()
  }

  private initializeRules() {
    this.rules = [
      {
        name: "odometer_jump",
        type: "warning",
        check: (record, context) => {
          const lastOdometer = context.lastOdometer || 0
          return record.odometer - lastOdometer > 3000
        },
        message: (record, context) => `Large odometer jump: ${record.odometer - (context.lastOdometer || 0)}km`,
        suggestion: () => "Verify odometer reading or check for missing refuel records",
      },
      {
        name: "negative_progression",
        type: "error",
        check: (record, context) => {
          const lastOdometer = context.lastOdometer || 0
          return record.odometer < lastOdometer
        },
        message: () => "Odometer reading is lower than previous record",
        suggestion: () => "Correct odometer value or check date sequence",
      },
      {
        name: "fuel_efficiency_anomaly",
        type: "warning",
        check: (record, context) => {
          if (!context.avgEfficiency || !context.lastOdometer) return false
          const kmDriven = record.odometer - context.lastOdometer
          const currentEfficiency = kmDriven / record.liters
          const efficiencyDiff = Math.abs(currentEfficiency - context.avgEfficiency)
          return efficiencyDiff > context.avgEfficiency * 0.5
        },
        message: (record, context) => {
          const kmDriven = record.odometer - context.lastOdometer
          const currentEfficiency = kmDriven / record.liters
          return `Unusual fuel efficiency: ${currentEfficiency.toFixed(2)} vs avg ${context.avgEfficiency.toFixed(2)} L/100km`
        },
        suggestion: () => "Verify fuel amount and odometer reading",
      },
    ]
  }

  validateRecord(record: any, vehicleId: string): ValidationFlag[] {
    const context = this.vehicleStats.get(vehicleId) || {}
    const flags: ValidationFlag[] = []

    this.rules.forEach((rule) => {
      if (rule.check(record, context)) {
        flags.push({
          type: rule.name,
          severity: rule.type,
          message: rule.message(record, context),
          suggestion: rule.suggestion?.(record, context),
        })
      }
    })

    return flags
  }

  updateVehicleStats(vehicleId: string, stats: any) {
    this.vehicleStats.set(vehicleId, stats)
  }

  async validateBatch(records: any[], onProgress?: (progress: number) => void): Promise<any[]> {
    const validatedRecords = []

    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const flags = this.validateRecord(record, record.vehicle_id)
      validatedRecords.push({ ...record, flags })

      if (onProgress) {
        onProgress(((i + 1) / records.length) * 100)
      }
    }

    return validatedRecords
  }
}

export const validationEngine = new FleetValidationEngine()
