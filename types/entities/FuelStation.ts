export interface FuelStation {
  id: string // varchar(20)
  name: string // varchar(200)
  brand?: string // varchar(100)
  address?: string // text
  location_id?: string // varchar(20), FK to locations
  coordinates?: string // point (stored as string in JSON)
  fuel_types?: string // text
  is_active?: boolean // default true
  created_at?: string // timestamp with time zone
  updated_at?: string // timestamp with time zone
  // Relations
  location?: {
    id: string
    name: string
  }
}
