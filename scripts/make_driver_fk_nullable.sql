-- Make foreign key fields in drivers table nullable
-- This allows drivers to exist without being immediately assigned to users or departments

ALTER TABLE drivers 
ALTER COLUMN user_id DROP NOT NULL,
ALTER COLUMN department_id DROP NOT NULL;

-- Add some sample data with the current structure
INSERT INTO departments (name, description) VALUES 
('Operations', 'Fleet operations and logistics'),
('Maintenance', 'Vehicle maintenance and repairs'),
('Administration', 'Administrative and support functions');

INSERT INTO users (email, name, role, is_active) VALUES 
('ana.cota@mobiazores.pt', 'Ana Cota', 'driver', true),
('joao.silva@mobiazores.pt', 'João Silva', 'driver', true),
('maria.santos@mobiazores.pt', 'Maria Santos', 'manager', true);

-- Update existing drivers to link them with users and departments
UPDATE drivers 
SET user_id = (SELECT id FROM users WHERE email = 'ana.cota@mobiazores.pt' LIMIT 1),
    department_id = (SELECT id FROM departments WHERE name = 'Operations' LIMIT 1)
WHERE name = 'Ana Cota';

UPDATE drivers 
SET user_id = (SELECT id FROM users WHERE email = 'joao.silva@mobiazores.pt' LIMIT 1),
    department_id = (SELECT id FROM departments WHERE name = 'Maintenance' LIMIT 1)
WHERE name = 'João Silva';

UPDATE drivers 
SET user_id = (SELECT id FROM users WHERE email = 'maria.santos@mobiazores.pt' LIMIT 1),
    department_id = (SELECT id FROM departments WHERE name = 'Administration' LIMIT 1)
WHERE name = 'Maria Santos';
