// Database types and form schemas
export * from "./forms"

// Re-export commonly used schemas for convenience
export {
  VehicleFormSchema,
  RefuelFormSchema,
  MaintenanceScheduleFormSchema,
  DriverFormSchema,
  LocationFormSchema,
  DepartmentFormSchema,
  type VehicleFormData,
  type RefuelFormData,
  type MaintenanceScheduleFormData,
  type DriverFormData,
  type LocationFormData,
  type DepartmentFormData,
} from "./forms"

// Database entity types
export interface Vehicle {
  id: string
  license_plate: string
  vehicle_internal_number: string
  make: string
  model: string
  year: number
  vin?: string
  category_id?: string
  department_id?: string
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid"
  fuel_capacity?: number
  status: "active" | "maintenance" | "inactive" | "retired"
  purchase_date?: string
  purchase_price?: number
  current_mileage: number
  insurance_policy?: string
  insurance_expiry?: string
  inspection_expiry?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  description?: string
  budget?: number
  manager_id?: string
  location_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VehicleCategory {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  user_id: string
  license_number: string
  license_categories: string[]
  license_expiry: string
  medical_certificate_expiry: string
  department_id: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  address?: string
  city?: string
  region?: string
  country?: string
  internal_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RefuelRecord {
  id: string
  vehicle_id: string
  driver_id?: string
  refuel_date: string
  odometer_reading: number
  liters: number
  cost_per_liter: number
  total_cost: number
  fuel_station_id?: string
  fuel_station_internal_number?: string
  receipt_number?: string
  notes?: string
  calculated_odometer_difference?: number
  created_at: string
  updated_at: string
}

export interface MaintenanceIntervention {
  id: string
  vehicle_id: string
  maintenance_type_id?: string
  intervention_date: string
  scheduled_date?: string
  odometer_reading?: number
  description?: string
  total_cost?: number
  duration_hours?: number
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  notes?: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse {
  success: boolean
  error?: string
  data?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
