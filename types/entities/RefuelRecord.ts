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

