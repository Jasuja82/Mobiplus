-- Create assignment types table for vehicle categories
CREATE TABLE IF NOT EXISTS assignment_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert standard assignment types
INSERT INTO assignment_types (name, description) VALUES
  ('Urbana', 'Urban transportation services'),
  ('Interurbana', 'Inter-urban transportation services'),
  ('Minibus', 'Minibus transportation services'),
  ('Turismo', 'Tourism transportation services'),
  ('Escolar', 'School transportation services'),
  ('Especial', 'Special transportation services')
ON CONFLICT (name) DO NOTHING;

-- Add assignment_type_id to vehicles table if not exists
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS assignment_type_id UUID REFERENCES assignment_types(id),
ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS internal_number VARCHAR(20);

-- Add employee_number to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS employee_number VARCHAR(20);

-- Add internal_number to locations table if not exists
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS internal_number VARCHAR(20);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_assignment_type ON vehicles(assignment_type_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_number ON users(employee_number);
CREATE INDEX IF NOT EXISTS idx_locations_internal_number ON locations(internal_number);
