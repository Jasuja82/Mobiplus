export interface User {
  id: string
  email: string
  name: string
  employee_number: number | null
  department: string
  role: "fleet_manager" | "maintenance_tech" | "admin" | "driver"
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
