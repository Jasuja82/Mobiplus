export interface Assignment {
  id: string // varchar(20)
  vehicle_id: string // varchar(20)
  name: string // varchar(20)
  type?: string // text, FK to assignment_types(name)
  is_active?: boolean // default true
  notes?: string // text
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
  // Relations
  vehicle?: {
    id: string
    license_plate: string
    internal_number?: string
  }
  assignment_type?: {
    name: string
    description?: string
    color?: string
  }
}
