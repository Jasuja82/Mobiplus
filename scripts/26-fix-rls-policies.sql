-- Fix infinite recursion in RLS policies for users table
-- This removes problematic policies and creates simple, non-recursive ones

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Allow authenticated users to read users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own record" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Fix other tables that might have similar issues
DROP POLICY IF EXISTS "Enable read access for all users" ON drivers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON drivers;
DROP POLICY IF EXISTS "Enable update for users based on email" ON drivers;

CREATE POLICY "Allow authenticated users to read drivers" ON drivers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert drivers" ON drivers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update drivers" ON drivers
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Fix vehicles table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vehicles;

CREATE POLICY "Allow authenticated users to read vehicles" ON vehicles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vehicles" ON vehicles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fix refuel_records table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON refuel_records;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON refuel_records;

CREATE POLICY "Allow authenticated users to read refuel records" ON refuel_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert refuel records" ON refuel_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
