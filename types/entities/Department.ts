export interface Department {
  id: string
  name: string
  description: string | null
  manager_id: string | null
  budget: number | null
  location_id: string | null
  created_at: string
  updated_at: string
}
