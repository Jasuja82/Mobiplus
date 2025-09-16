export interface Vehicle {
  id: string
  internal_number: string
  license_plate: string
  make_id: string | null
  model_id: string | null
  vehicle_details_id: string | null
  engine_type_id: string | null
  assignment_id: string | null
  status: "active" | "maintenance" | "retired" | "reserved"
  notes: string | null
  year: number | null
  vin: string | null
  fuel_capacity: number | null
  current_mileage: number
  purchase_date: string | null
  purchase_price: number | null
  insurance_expiry: string | null
  inspection_expiry: string | null
  department_id: string | null
  home_location_id: string | null
  current_location_id: string | null
  created_at: string
  updated_at: string
}

export interface VehicleWithDetails extends Vehicle {
  make_name?: string
  model_name?: string
  department_name?: string
  home_location_name?: string
}
