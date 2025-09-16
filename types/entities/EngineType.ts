export interface EngineType {
  id: string
  name: string
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid"
  displacement: number | null
  power_hp: number | null
  created_at: string
}
