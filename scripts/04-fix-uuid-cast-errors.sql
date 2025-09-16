-- Fix UUID cast errors by ensuring proper data types and relationships

-- Ensure refuel_records.driver_id references drivers.id (integer)
-- and vehicle_assignments.driver_id references users.id (uuid)

-- Check current foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('refuel_records', 'vehicle_assignments', 'drivers');

-- Update any incorrect driver_id references in refuel_records
-- This ensures refuel_records.driver_id properly references drivers.id (integer)
UPDATE refuel_records 
SET driver_id = (
    SELECT d.id 
    FROM drivers d 
    WHERE d.user_id = refuel_records.driver_id::uuid
)
WHERE driver_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Ensure vehicle_assignments.driver_id references users.id (uuid)
-- This table should reference users directly, not drivers
ALTER TABLE vehicle_assignments 
DROP CONSTRAINT IF EXISTS vehicle_assignments_driver_id_fkey;

ALTER TABLE vehicle_assignments 
ADD CONSTRAINT vehicle_assignments_driver_id_fkey 
FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE;
