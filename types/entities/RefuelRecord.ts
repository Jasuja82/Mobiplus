export interface RefuelRecord {
  id: string
  vehicle_id: string
  driver_id: string
  fuel_station_id: string | null
  refuel_date: string
  odometer_reading: number
  liters: number
  cost_per_liter: number
  total_cost: number
  odometer_difference: number | null
  notes: string | null
  receipt_number: string | null
  invoice_number: string | null
  is_full_tank: boolean
  fuel_efficiency_l_per_100km: number | null
  cost_per_km: number | null
  km_per_liter: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}
