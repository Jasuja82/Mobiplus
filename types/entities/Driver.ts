export interface Driver {
  id: string
  internal_number: string
  name: string
  dob: string | null
  license_type_id: string | null
  status: string
  phone: string | null
  email: string | null
  hire_date: string | null
  created_at: string
  updated_at: string
}
