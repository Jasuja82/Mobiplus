export interface FuelPricePerMonth {
  id: string
  year: number
  month: number
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid"
  price_per_liter: number
  region: string
  created_at: string
  updated_at: string
}
