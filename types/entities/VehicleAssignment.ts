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
