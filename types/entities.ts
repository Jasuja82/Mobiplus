// Entity types for database tables
export interface User {
  id: string
  email: string
  name: string
  employee_number: number | null
  department: string
  role: "fleet_manager" | "maintenance_tech" | "admin" | "driver"
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  description: string | null
  manager_id: string | null
  budget: number | null
  location_id: string | null
  created_at: string
  updated_at: string
}

export interface VehicleCategory {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Vehicle {
  id: string
  license_plate: string
  make: string
  model: string
  year: number
  vin: string | null
  category_id: string | null
  department_id: string | null
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid"
  fuel_capacity: number | null
  status: "active" | "maintenance" | "inactive" | "retired"
  purchase_date: string | null
  purchase_price: number | null
  current_mileage: number
  insurance_policy: string | null
  insurance_expiry: string | null
  inspection_expiry: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  user_id: string | null
  license_number: string
  license_expiry: string
  license_categories: string[] | null
  medical_certificate_expiry: string | null
  department_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  region: string | null
  country: string | null
  coordinates: any | null
  internal_number: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RefuelRecord {
  id: string
  vehicle_id: string
  driver_id: string | null
  refuel_date: string
  mileage: number
  liters: number
  cost_per_liter: number
  total_cost: number
  fuel_station: string | null
  receipt_number: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceCategory {
  id: string
  name: string
  description: string | null
  default_interval_km: number | null
  default_interval_months: number | null
  created_at: string
}

export interface MaintenanceSchedule {
  id: string
  vehicle_id: string
  category_id: string | null
  scheduled_date: string
  scheduled_mileage: number | null
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  priority: number
  estimated_cost: number | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceIntervention {
  id: string
  schedule_id: string | null
  vehicle_id: string
  intervention_date: string
  mileage: number
  description: string
  work_performed: string | null
  parts_used: string | null
  labor_hours: number | null
  parts_cost: number | null
  labor_cost: number | null
  total_cost: number | null
  technician_id: string | null
  supplier: string | null
  invoice_number: string | null
  warranty_until: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface VehicleAssignment {
  id: string
  vehicle_id: string
  driver_id: string
  assigned_at: string
  assigned_by: string | null
  unassigned_at: string | null
  is_active: boolean
  notes: string | null
}

export interface FuelStation {
  id: string
  name: string
  brand: string | null
  location_id: string | null
  address: string | null
  coordinates: any | null
  is_active: boolean
  created_at: string
  updated_at: string
}