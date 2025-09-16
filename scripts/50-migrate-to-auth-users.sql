-- Migration script to remove employees table and use auth.users instead
-- This script creates a profiles table that references auth.users

-- First, create a profiles table that references auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  department_id VARCHAR(20) REFERENCES departments(id),
  role TEXT DEFAULT 'driver',
  employee_number VARCHAR(50) UNIQUE,
  phone VARCHAR(20),
  license_type_id VARCHAR(20) REFERENCES license_types(id),
  license_number VARCHAR(100),
  license_expiry DATE,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Create admin policies for user management
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Remove foreign key constraints that reference employees table
-- Remove existing foreign key constraints before dropping employees table
ALTER TABLE departments DROP CONSTRAINT IF EXISTS fk_departments_manager;
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_employee_id_fkey;
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_assigned_by_fkey;

-- Set manager_id to NULL where it references non-existent employees
-- Clean up orphaned references in departments table
UPDATE departments SET manager_id = NULL WHERE manager_id IS NOT NULL;

-- Set employee_id to NULL where it references non-existent employees  
-- Clean up orphaned references in drivers table
UPDATE drivers SET employee_id = NULL WHERE employee_id IS NOT NULL;

-- Set assigned_by to NULL where it references non-existent employees
-- Clean up orphaned references in assignments table
UPDATE assignments SET assigned_by = NULL WHERE assigned_by IS NOT NULL;

-- Create a trigger to auto-create profiles for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    true
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated views that use profiles instead of employees
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    p.id,
    u.email,
    p.full_name,
    p.role,
    p.department_id,
    d.name as department_name,
    p.employee_number,
    p.phone,
    p.is_active,
    p.created_at,
    p.updated_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
LEFT JOIN departments d ON p.department_id = d.id;

-- Update refuel_analytics view to use profiles
CREATE OR REPLACE VIEW refuel_analytics AS
SELECT 
    rr.id,
    rr.vehicle_id,
    rr.driver_id,
    rr.fuel_station_id,
    rr.refuel_date,
    rr.odometer_reading,
    rr.odometer_difference,
    rr.liters,
    rr.cost_per_liter,
    rr.total_cost,
    rr.notes,
    -- Vehicle information
    vs.license_plate as vehicle_number,
    vs.make as vehicle_make,
    vs.model as vehicle_model,
    vs.year as vehicle_year,
    vs.department_name,
    -- Location information
    l.name as location_name,
    l.city,
    l.region,
    l.internal_number,
    -- Driver information
    d.full_name as driver_name,
    d.code as driver_code,
    -- Fuel station information
    fs.name as fuel_station_name,
    fs.brand as fuel_station_brand
FROM refuel_records rr
JOIN vehicle_summary vs ON rr.vehicle_id = vs.id
LEFT JOIN locations l ON vs.home_location_id = l.id
LEFT JOIN drivers d ON rr.driver_id = d.id
LEFT JOIN fuel_stations fs ON rr.fuel_station_id = fs.id;

-- Drop the employees table after cleaning up references
-- Now safe to drop the employees table since all foreign key constraints are removed
DROP TABLE IF EXISTS employees CASCADE;

COMMIT;
