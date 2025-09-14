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
