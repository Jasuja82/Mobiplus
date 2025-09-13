-- Disable RLS temporarily for data import
-- This allows the service role to insert data without policy restrictions

-- Disable RLS on all tables for import
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE refuel_records DISABLE ROW LEVEL SECURITY;

-- Drop any existing problematic policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- Drop policies on other tables
DROP POLICY IF EXISTS "Enable read access for all users" ON departments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON departments;
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON locations;
DROP POLICY IF EXISTS "Enable read access for all users" ON drivers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON drivers;
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Enable read access for all users" ON assignments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON assignments;
DROP POLICY IF EXISTS "Enable read access for all users" ON refuel_records;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON refuel_records;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'locations', 'users', 'drivers', 'vehicles', 'assignments', 'refuel_records');
