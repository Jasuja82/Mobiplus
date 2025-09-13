// Import-specific types
export interface CSVData {
  headers: string[]
  rows: string[][]
  fileName: string
  fileSize: number
}

export interface ColumnMapping {
  [csvColumn: string]: string | null
}

export interface ImportStep {
  id: string
  title: string
  description: string
  status: "pending" | "active" | "completed" | "error"
}

export interface ValidationFlag {
  type: string
  severity: "error" | "warning"
  message: string
  suggestion?: string
}

export interface ParsedRecord {
  [key: string]: any
  flags?: ValidationFlag[]
  isValid: boolean
}

export interface ImportSession {
  id: string
  fileName: string
  totalRows: number
  currentStep: number
  csvData: CSVData | null
  columnMapping: ColumnMapping
  validationErrors: ValidationFlag[]
  createdAt: Date
  updatedAt: Date
}

// Database field definitions for mapping
export interface DatabaseField {
  id: string
  label: string
  required: boolean
  type: "string" | "number" | "date" | "boolean"
  table: string
  column: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export const DATABASE_FIELDS: DatabaseField[] = [
  {
    id: "vehicle.internal_number",
    label: "Vehicle Internal Number",
    required: true,
    type: "string",
    table: "vehicles",
    column: "internal_number"
  },
  {
    id: "vehicle.license_plate",
    label: "License Plate",
    required: true,
    type: "string",
    table: "vehicles",
    column: "license_plate"
  },
  {
    id: "refuel.date",
    label: "Refuel Date",
    required: true,
    type: "date",
    table: "refuel_records",
    column: "refuel_date"
  },
  {
    id: "refuel.liters",
    label: "Liters",
    required: true,
    type: "number",
    table: "refuel_records",
    column: "liters",
    validation: { min: 0.1, max: 500 }
  },
  {
    id: "refuel.odometer_reading",
    label: "Odometer Reading",
    required: true,
    type: "number",
    table: "refuel_records",
    column: "mileage",
    validation: { min: 0 }
  },
  {
    id: "driver.name",
    label: "Driver Name",
    required: false,
    type: "string",
    table: "drivers",
    column: "name"
  },
  {
    id: "department.name",
    label: "Department",
    required: false,
    type: "string",
    table: "departments",
    column: "name"
  },
  {
    id: "location.name",
    label: "Location",
    required: false,
    type: "string",
    table: "locations",
    column: "name"
  },
  {
    id: "refuel.cost_per_liter",
    label: "Cost per Liter",
    required: false,
    type: "number",
    table: "refuel_records",
    column: "cost_per_liter",
    validation: { min: 0.1, max: 10 }
  },
  {
    id: "refuel.notes",
    label: "Notes",
    required: false,
    type: "string",
    table: "refuel_records",
    column: "notes"
  }
]