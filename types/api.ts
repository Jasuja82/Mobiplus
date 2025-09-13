// API response types and interfaces
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Statistics types
export interface FleetStats {
  totalVehicles: number
  activeVehicles: number
  maintenanceVehicles: number
  inactiveVehicles: number
  totalFuelCost: number
  totalMaintenanceCost: number
  averageFuelConsumption: number
}

export interface FuelStats {
  totalCost: number
  totalLiters: number
  averageCostPerLiter: number
  totalRefuels: number
  monthlyData: Array<{
    month: string
    cost: number
    liters: number
    refuels: number
  }>
}

export interface MaintenanceStats {
  totalCost: number
  scheduledCount: number
  completedCount: number
  overdueCount: number
  monthlyData: Array<{
    month: string
    cost: number
    interventions: number
  }>
}

// Import/Export types
export interface ImportProgress {
  step: number
  totalSteps: number
  currentOperation: string
  recordsProcessed: number
  totalRecords: number
  errors: string[]
  warnings: string[]
}

export interface ExportOptions {
  format: "csv" | "excel" | "pdf"
  dateFrom?: string
  dateTo?: string
  vehicleId?: string
  driverId?: string
  includeHeaders: boolean
  includeCalculatedFields: boolean
}

export interface ValidationError {
  row: number
  column: string
  value: string
  error: string
  severity: "error" | "warning"
}

export interface ImportResult {
  totalRows: number
  successfulImports: number
  errors: number
  warnings: number
  duration: string
  createdRecords: {
    vehicles?: number
    drivers?: number
    refuelRecords?: number
    locations?: number
    departments?: number
  }
  validationErrors: ValidationError[]
}