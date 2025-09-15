-- Create sample departments
INSERT INTO departments (id, name, description) VALUES
  ('dept-001', 'Transportes', 'Departamento de Transportes Públicos'),
  ('dept-002', 'Manutenção', 'Departamento de Manutenção de Frota'),
  ('dept-003', 'Administração', 'Departamento Administrativo'),
  ('dept-004', 'Operações', 'Departamento de Operações')
ON CONFLICT (id) DO NOTHING;

-- Create sample users for drivers
INSERT INTO users (id, email, name, phone, role, is_active) VALUES
  ('user-ana-cota', 'ana.cota@mobiazores.pt', 'Ana Cota', '+351 296 123 001', 'driver', true),
  ('user-carlos-silva', 'carlos.silva@mobiazores.pt', 'Carlos Silva', '+351 296 123 002', 'driver', true),
  ('user-maria-santos', 'maria.santos@mobiazores.pt', 'Maria Santos', '+351 296 123 003', 'driver', true),
  ('user-joao-pereira', 'joao.pereira@mobiazores.pt', 'João Pereira', '+351 296 123 004', 'driver', true),
  ('user-teresa-costa', 'teresa.costa@mobiazores.pt', 'Teresa Costa', '+351 296 123 005', 'driver', true)
ON CONFLICT (id) DO NOTHING;

-- Update existing drivers with proper relations
UPDATE drivers SET 
  user_id = 'user-ana-cota',
  department_id = 'dept-001',
  license_number = 'PT123456789',
  license_expiry = '2026-12-31',
  license_categories = ARRAY['B', 'C', 'D']
WHERE name = 'Ana Cota' AND internal_number = 'AOR0003';

-- Fixed UPDATE statements by removing LIMIT and using subqueries instead
-- Update one driver matching Carlos
UPDATE drivers SET 
  user_id = 'user-carlos-silva',
  department_id = 'dept-001',
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
  user_id = 'user-maria-santos',
  department_id = 'dept-002',
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
  user_id = 'user-joao-pereira',
  department_id = 'dept-003',
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
  user_id = 'user-teresa-costa',
  department_id = 'dept-004',
  license_number = 'PT321654987',
  license_expiry = '2026-06-30',
  license_categories = ARRAY['B', 'C']
WHERE id = (
  SELECT id FROM drivers 
  WHERE name ILIKE '%Teresa%' AND user_id IS NULL 
  LIMIT 1
);
