export interface AssignmentType {
  id: string
  name: string
  description?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code?: string
  description?: string
  manager_id?: string
  location_id?: string
  budget_limit?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MaintenanceSchedule {
  id: string
  vehicle_id: string
  maintenance_type: "preventive" | "corrective" | "inspection"
  title: string
  description?: string
  scheduled_date: string
  scheduled_mileage?: number
  priority: "low" | "medium" | "high" | "critical"
  estimated_cost?: number
  estimated_duration_hours?: number
  assigned_to?: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "overdue"
  completed_date?: string
  actual_cost?: number
  actual_duration_hours?: number
  notes?: string
  next_service_date?: string
  next_service_mileage?: number
  created_at: string
  updated_at: string
  // Relations
  vehicle?: {
    id: string
    license_plate: string
    internal_number?: string
  }
}

export interface RefuelAnalytics {
  id: string
  vehicle_id: string
  license_plate?: string
  vehicle_number?: string
  internal_number?: string
  driver_id: string
  driver_name?: string
  driver_code?: string
  fuel_station_id?: string
  fuel_station_name?: string
  fuel_station_brand?: string
  location_name?: string
  data: string // refuel_date
  liters: number
  literCost: number // cost_per_liter
  calculatedTotalLiterCost: number // total_cost
  odometer: number // odometer_reading
  calculatedOdometerDifference: number // odometer_difference
  notes?: string
  created: string
  updated: string
  // Calculated fields
  cost_per_liter_calculated: number
  fuel_efficiency_l_per_100km?: number
  km_per_liter?: number
  // Validation flags
  has_negative_mileage: boolean
  has_high_mileage_jump: boolean
  has_high_fuel_volume: boolean
  has_unusual_fuel_price: boolean
}

// Update existing types to be consistent
export interface Vehicle {
  id: string
  license_plate: string
  internal_number?: string
  vehicle_number?: string
  vin?: string
  status: "active" | "maintenance" | "inactive" | "retired"
  current_mileage: number
  department_id?: string
  current_location_id?: string
  home_location_id?: string
  vehicle_details_id?: string
  purchase_date?: string
  purchase_price?: number
  registration_date?: string
  insurance_policy?: string
  insurance_expiry?: string
  inspection_expiry?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  vehicle_id: string
  name: string
  type: string // references assignment_types.name
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RefuelRecord {
  id: string
  vehicle_id: string
  driver_id: string
  refuel_date: string
  odometer_reading: number
  liters: number
  cost_per_liter: number
  total_cost: number
  odometer_difference?: number
  fuel_station_id?: string
  notes?: string
  created_at: string
  updated_at: string
}
