export interface MaintenanceCategory {
  id: string
  name: string
  description: string | null
  default_interval_km: number | null
  default_interval_months: number | null
  created_at: string
}
