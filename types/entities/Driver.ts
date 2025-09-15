export interface Driver {
  id: string
  user_id: string | null
  name: string // Added name field that exists in database
  internal_number: string // Added internal_number field that exists in database
  license_number: string | null
  license_expiry: string | null
  license_categories: string[] | null
  medical_certificate_expiry: string | null
  department_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
