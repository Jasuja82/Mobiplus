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
  id: string // varchar, default gen_random_uuid()
  name: string // varchar, unique
  code?: string // varchar(10), unique
  description?: string // text
  manager_id?: string // varchar
  location_id?: string // varchar, FK to locations
  budget_limit?: number // numeric(12,2)
  is_active?: boolean // default true
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
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
  id: string // varchar(20)
  vehicle_details_id?: string // varchar(20)
  license_plate: string // varchar(20), unique
  vin?: string // varchar(50), unique
  vehicle_number?: string // varchar(50)
  internal_number?: string // varchar(50)
  department_id?: string // varchar(20)
  home_location_id?: string // varchar(20), FK to locations
  current_location_id?: string // varchar(20), FK to locations
  status?: "active" | "maintenance" | "inactive" | "retired" // enum vehicle_status, default 'active'
  purchase_date?: string // date
  purchase_price?: number // numeric(12,2)
  registration_date?: string // date
  current_mileage?: number // integer, default 0
  insurance_policy?: string // varchar(100)
  insurance_expiry?: string // date
  inspection_expiry?: string // date
  notes?: string // text
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
}

export interface Assignment {
  id: string // varchar(20)
  vehicle_id: string // varchar(20)
  name: string // varchar(20)
  type?: string // text, FK to assignment_types(name)
  is_active?: boolean // default true
  notes?: string // text
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
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

export interface Driver {
  id: string // varchar(20)
  code?: string // varchar(50), unique
  full_name: string // varchar(200)
  license_number?: string // varchar(100)
  license_expiry?: string // date
  medical_certificate_expiry?: string // date
  is_active?: boolean // default true
  status?: boolean
  dob?: string // date
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
}

export interface Location {
  id: string // varchar(20)
  name: string // varchar(200)
  address?: string // text
  coordinates?: string // point (stored as string in JSON)
  location_type?: string // varchar(50)
  is_active?: boolean // default true
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
}

export interface FuelStation {
  id: string // varchar(20)
  name: string // varchar(200)
  brand?: string // varchar(100)
  address?: string // text
  location_id?: string // varchar(20), FK to locations
  coordinates?: string // point (stored as string in JSON)
  fuel_types?: string // text
  is_active?: boolean // default true
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
}

export interface FuelPricePerMonth {
  id: string // varchar(20)
  year: number // integer
  month: number // integer, check (month >= 1 and month <= 12)
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid" // enum fuel_type
  price_per_liter: number // numeric(6,3)
  region?: string // varchar(100), default 'Azores'
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
}
