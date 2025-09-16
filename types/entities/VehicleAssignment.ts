export interface VehicleAssignment {
  id: string
  vehicle_id: string
  driver_id: number // Integer to match drivers table
  assigned_at: string
  assigned_by: string | null
  unassigned_at: string | null
  is_active: boolean
  notes: string | null
}
