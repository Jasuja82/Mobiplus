export interface Driver {
  id: string
  user_id: string | null
  license_number: string
  license_expiry: string
  license_categories: string[] | null
  medical_certificate_expiry: string | null
  department_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
