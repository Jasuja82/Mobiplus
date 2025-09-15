-- Remove explicit UUID values and let PostgreSQL generate them automatically
-- Create sample departments
INSERT INTO departments (name, description) VALUES
  ('Transportes', 'Departamento de Transportes Públicos'),
  ('Manutenção', 'Departamento de Manutenção de Frota'),
  ('Administração', 'Departamento Administrativo'),
  ('Operações', 'Departamento de Operações')
ON CONFLICT (name) DO NOTHING;

-- Create sample users for drivers
INSERT INTO users (email, name, phone, role, is_active) VALUES
  ('ana.cota@mobiazores.pt', 'Ana Cota', '+351 296 123 001', 'driver', true),
  ('carlos.silva@mobiazores.pt', 'Carlos Silva', '+351 296 123 002', 'driver', true),
  ('maria.santos@mobiazores.pt', 'Maria Santos', '+351 296 123 003', 'driver', true),
  ('joao.pereira@mobiazores.pt', 'João Pereira', '+351 296 123 004', 'driver', true),
  ('teresa.costa@mobiazores.pt', 'Teresa Costa', '+351 296 123 005', 'driver', true)
ON CONFLICT (email) DO NOTHING;

-- Update drivers using proper UUID lookups from the created records
-- Update existing drivers with proper relations using subqueries to get UUIDs
UPDATE drivers SET 
  user_id = (SELECT id FROM users WHERE email = 'ana.cota@mobiazores.pt'),
  department_id = (SELECT id FROM departments WHERE name = 'Transportes'),
  license_number = 'PT123456789',
  license_expiry = '2026-12-31',
  license_categories = ARRAY['B', 'C', 'D']
WHERE name = 'Ana Cota' AND internal_number = 'AOR0003';

-- Update one driver matching Carlos
UPDATE drivers SET 
  user_id = (SELECT id FROM users WHERE email = 'carlos.silva@mobiazores.pt'),
  department_id = (SELECT id FROM departments WHERE name = 'Transportes'),
  license_number = 'PT987654321',
  license_expiry = '2025-08-15',
  license_categories = ARRAY['B', 'C']
WHERE id = (
  SELECT id FROM drivers 
  WHERE name ILIKE '%Carlos%' AND user_id IS NULL 
  LIMIT 1
);

-- Update one driver matching Maria
UPDATE drivers SET 
  user_id = (SELECT id FROM users WHERE email = 'maria.santos@mobiazores.pt'),
  department_id = (SELECT id FROM departments WHERE name = 'Manutenção'),
  license_number = 'PT456789123',
  license_expiry = '2027-03-20',
  license_categories = ARRAY['B']
WHERE id = (
  SELECT id FROM drivers 
  WHERE name ILIKE '%Maria%' AND user_id IS NULL 
  LIMIT 1
);

-- Update one driver matching João
UPDATE drivers SET 
  user_id = (SELECT id FROM users WHERE email = 'joao.pereira@mobiazores.pt'),
  department_id = (SELECT id FROM departments WHERE name = 'Administração'),
  license_number = 'PT789123456',
  license_expiry = '2025-11-10',
  license_categories = ARRAY['B', 'C', 'D', 'E']
WHERE id = (
  SELECT id FROM drivers 
  WHERE (name ILIKE '%João%' OR name ILIKE '%Joao%') AND user_id IS NULL 
  LIMIT 1
);

-- Update one driver matching Teresa
UPDATE drivers SET 
  user_id = (SELECT id FROM users WHERE email = 'teresa.costa@mobiazores.pt'),
  department_id = (SELECT id FROM departments WHERE name = 'Operações'),
  license_number = 'PT321654987',
  license_expiry = '2026-06-30',
  license_categories = ARRAY['B', 'C']
WHERE id = (
  SELECT id FROM drivers 
  WHERE name ILIKE '%Teresa%' AND user_id IS NULL 
  LIMIT 1
);
