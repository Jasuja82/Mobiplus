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
  registration_date: string | null
  vehicle_number: string | null
  internal_number: string | null
  assignment_type_id: string | null
  current_location_id: string | null
  home_location_id: string | null
  created_at: string
  updated_at: string
}

export interface VehicleWithAge extends Vehicle {
  age_years: number | null
}
