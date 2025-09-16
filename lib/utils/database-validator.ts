import { createClient } from "@/lib/supabase/client"

export interface ValidationResult {
  table: string
  totalRecords: number
  issues: ValidationIssue[]
  score: number // 0-100, higher is better
}

export interface ValidationIssue {
  type: "error" | "warning" | "info"
  field: string
  count: number
  description: string
  severity: "low" | "medium" | "high" | "critical"
}

export class DatabaseValidator {
  private supabase = createClient()

  async validateDatabase(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    try {
      // Validate refuel records
      const refuelValidation = await this.validateRefuelRecords()
      results.push(refuelValidation)

      // Validate vehicles
      const vehicleValidation = await this.validateVehicles()
      results.push(vehicleValidation)

      // Validate drivers
      const driverValidation = await this.validateDrivers()
      results.push(driverValidation)

      // Validate assignments
      const assignmentValidation = await this.validateAssignments()
      results.push(assignmentValidation)

      // Validate departments
      const departmentValidation = await this.validateDepartments()
      results.push(departmentValidation)
    } catch (error) {
      console.error("Database validation error:", error)
    }

    return results
  }

  private async validateRefuelRecords(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = []
    let totalRecords = 0

    try {
      // Get total count
      const { count } = await this.supabase.from("refuel_records").select("*", { count: "exact", head: true })

      totalRecords = count || 0

      // Check for negative mileage
      const { count: negativeMileage } = await this.supabase
        .from("refuel_records")
        .select("*", { count: "exact", head: true })
        .lt("odometer_difference", 0)

      if (negativeMileage && negativeMileage > 0) {
        issues.push({
          type: "error",
          field: "odometer_difference",
          count: negativeMileage,
          description: "Records with negative mileage progression",
          severity: "high",
        })
      }

      // Check for high mileage jumps
      const { count: highMileageJumps } = await this.supabase
        .from("refuel_records")
        .select("*", { count: "exact", head: true })
        .gt("odometer_difference", 1500)

      if (highMileageJumps && highMileageJumps > 0) {
        issues.push({
          type: "warning",
          field: "odometer_difference",
          count: highMileageJumps,
          description: "Records with unusually high mileage jumps (>1500km)",
          severity: "medium",
        })
      }

      // Check for unusual fuel volumes
      const { count: highVolume } = await this.supabase
        .from("refuel_records")
        .select("*", { count: "exact", head: true })
        .gt("liters", 200)

      if (highVolume && highVolume > 0) {
        issues.push({
          type: "warning",
          field: "liters",
          count: highVolume,
          description: "Records with unusually high fuel volume (>200L)",
          severity: "medium",
        })
      }

      // Check for unusual fuel prices
      const { count: unusualPrices } = await this.supabase
        .from("refuel_records")
        .select("*", { count: "exact", head: true })
        .or("cost_per_liter.lt.0.8,cost_per_liter.gt.2.5")

      if (unusualPrices && unusualPrices > 0) {
        issues.push({
          type: "warning",
          field: "cost_per_liter",
          count: unusualPrices,
          description: "Records with unusual fuel prices (<€0.80 or >€2.50)",
          severity: "medium",
        })
      }

      // Check for missing vehicle references
      const { count: missingVehicles } = await this.supabase
        .from("refuel_records")
        .select("*", { count: "exact", head: true })
        .is("vehicle_id", null)

      if (missingVehicles && missingVehicles > 0) {
        issues.push({
          type: "error",
          field: "vehicle_id",
          count: missingVehicles,
          description: "Records without vehicle reference",
          severity: "critical",
        })
      }

      // Check for missing driver references
      const { count: missingDrivers } = await this.supabase
        .from("refuel_records")
        .select("*", { count: "exact", head: true })
        .is("driver_id", null)

      if (missingDrivers && missingDrivers > 0) {
        issues.push({
          type: "error",
          field: "driver_id",
          count: missingDrivers,
          description: "Records without driver reference",
          severity: "critical",
        })
      }
    } catch (error) {
      console.error("Error validating refuel records:", error)
      issues.push({
        type: "error",
        field: "general",
        count: 0,
        description: "Failed to validate refuel records",
        severity: "critical",
      })
    }

    const score = this.calculateScore(totalRecords, issues)

    return {
      table: "refuel_records",
      totalRecords,
      issues,
      score,
    }
  }

  private async validateVehicles(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = []
    let totalRecords = 0

    try {
      const { count } = await this.supabase.from("vehicles").select("*", { count: "exact", head: true })

      totalRecords = count || 0

      // Check for missing license plates
      const { count: missingPlates } = await this.supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .or("license_plate.is.null,license_plate.eq.")

      if (missingPlates && missingPlates > 0) {
        issues.push({
          type: "error",
          field: "license_plate",
          count: missingPlates,
          description: "Vehicles without license plate",
          severity: "high",
        })
      }

      // Check for invalid status
      const { count: invalidStatus } = await this.supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .not("status", "in", "(active,maintenance,inactive,retired)")

      if (invalidStatus && invalidStatus > 0) {
        issues.push({
          type: "warning",
          field: "status",
          count: invalidStatus,
          description: "Vehicles with invalid status",
          severity: "medium",
        })
      }

      // Check for negative mileage
      const { count: negativeMileage } = await this.supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .lt("current_mileage", 0)

      if (negativeMileage && negativeMileage > 0) {
        issues.push({
          type: "error",
          field: "current_mileage",
          count: negativeMileage,
          description: "Vehicles with negative mileage",
          severity: "high",
        })
      }
    } catch (error) {
      console.error("Error validating vehicles:", error)
      issues.push({
        type: "error",
        field: "general",
        count: 0,
        description: "Failed to validate vehicles",
        severity: "critical",
      })
    }

    const score = this.calculateScore(totalRecords, issues)

    return {
      table: "vehicles",
      totalRecords,
      issues,
      score,
    }
  }

  private async validateDrivers(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = []
    let totalRecords = 0

    try {
      const { count } = await this.supabase.from("drivers").select("*", { count: "exact", head: true })

      totalRecords = count || 0

      // Check for missing names
      const { count: missingNames } = await this.supabase
        .from("drivers")
        .select("*", { count: "exact", head: true })
        .or("full_name.is.null,full_name.eq.")

      if (missingNames && missingNames > 0) {
        issues.push({
          type: "error",
          field: "full_name",
          count: missingNames,
          description: "Drivers without name",
          severity: "high",
        })
      }

      // Check for missing codes
      const { count: missingCodes } = await this.supabase
        .from("drivers")
        .select("*", { count: "exact", head: true })
        .or("code.is.null,code.eq.")

      if (missingCodes && missingCodes > 0) {
        issues.push({
          type: "warning",
          field: "code",
          count: missingCodes,
          description: "Drivers without code",
          severity: "medium",
        })
      }
    } catch (error) {
      console.error("Error validating drivers:", error)
      issues.push({
        type: "error",
        field: "general",
        count: 0,
        description: "Failed to validate drivers",
        severity: "critical",
      })
    }

    const score = this.calculateScore(totalRecords, issues)

    return {
      table: "drivers",
      totalRecords,
      issues,
      score,
    }
  }

  private async validateAssignments(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = []
    let totalRecords = 0

    try {
      const { count } = await this.supabase.from("assignments").select("*", { count: "exact", head: true })

      totalRecords = count || 0

      // Check for invalid assignment types
      const { data: validTypes } = await this.supabase.from("assignment_types").select("name")

      const validTypeNames = validTypes?.map((t) => t.name) || []

      if (validTypeNames.length > 0) {
        const { count: invalidTypes } = await this.supabase
          .from("assignments")
          .select("*", { count: "exact", head: true })
          .not("type", "in", `(${validTypeNames.map((t) => `"${t}"`).join(",")})`)

        if (invalidTypes && invalidTypes > 0) {
          issues.push({
            type: "warning",
            field: "type",
            count: invalidTypes,
            description: "Assignments with invalid type reference",
            severity: "medium",
          })
        }
      }
    } catch (error) {
      console.error("Error validating assignments:", error)
      issues.push({
        type: "error",
        field: "general",
        count: 0,
        description: "Failed to validate assignments",
        severity: "critical",
      })
    }

    const score = this.calculateScore(totalRecords, issues)

    return {
      table: "assignments",
      totalRecords,
      issues,
      score,
    }
  }

  private async validateDepartments(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = []
    let totalRecords = 0

    try {
      const { count } = await this.supabase.from("departments").select("*", { count: "exact", head: true })

      totalRecords = count || 0

      // Check for missing names
      const { count: missingNames } = await this.supabase
        .from("departments")
        .select("*", { count: "exact", head: true })
        .or("name.is.null,name.eq.")

      if (missingNames && missingNames > 0) {
        issues.push({
          type: "error",
          field: "name",
          count: missingNames,
          description: "Departments without name",
          severity: "high",
        })
      }
    } catch (error) {
      console.error("Error validating departments:", error)
      issues.push({
        type: "error",
        field: "general",
        count: 0,
        description: "Failed to validate departments",
        severity: "critical",
      })
    }

    const score = this.calculateScore(totalRecords, issues)

    return {
      table: "departments",
      totalRecords,
      issues,
      score,
    }
  }

  private calculateScore(totalRecords: number, issues: ValidationIssue[]): number {
    if (totalRecords === 0) return 100

    let totalIssues = 0
    let weightedIssues = 0

    issues.forEach((issue) => {
      totalIssues += issue.count

      // Weight issues by severity
      const weight =
        {
          low: 1,
          medium: 2,
          high: 4,
          critical: 8,
        }[issue.severity] || 1

      weightedIssues += issue.count * weight
    })

    // Calculate score (0-100, higher is better)
    const maxPossibleWeight = totalRecords * 8 // All records with critical issues
    const score = Math.max(0, 100 - (weightedIssues / maxPossibleWeight) * 100)

    return Math.round(score)
  }

  async generateReport(): Promise<string> {
    const results = await this.validateDatabase()

    let report = "# Database Validation Report\n\n"
    report += `Generated: ${new Date().toLocaleString("pt-PT")}\n\n`

    let overallScore = 0
    let totalRecords = 0

    results.forEach((result) => {
      totalRecords += result.totalRecords
      overallScore += result.score * result.totalRecords
    })

    overallScore = totalRecords > 0 ? Math.round(overallScore / totalRecords) : 100

    report += `## Overall Score: ${overallScore}/100\n\n`

    results.forEach((result) => {
      report += `### ${result.table.toUpperCase()}\n`
      report += `- **Records**: ${result.totalRecords.toLocaleString()}\n`
      report += `- **Score**: ${result.score}/100\n`

      if (result.issues.length > 0) {
        report += `- **Issues**:\n`
        result.issues.forEach((issue) => {
          const icon =
            {
              error: "❌",
              warning: "⚠️",
              info: "ℹ️",
            }[issue.type] || "•"

          report += `  ${icon} ${issue.description}: ${issue.count} records\n`
        })
      } else {
        report += `- **Issues**: None ✅\n`
      }

      report += "\n"
    })

    return report
  }
}

// Export singleton instance
export const databaseValidator = new DatabaseValidator()
