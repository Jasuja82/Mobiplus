-- Fix driver-user relationship issues
-- The current schema has inconsistencies between drivers table and refuel_records

-- First, let's check if we need to update the drivers table structure
-- The drivers table should have integer IDs to match existing refuel_records.driver_id

-- Update drivers table to use integer IDs instead of UUID
-- This matches the existing refuel_records.driver_id column type

-- Drop existing foreign key constraints that might conflict
ALTER TABLE IF EXISTS public.vehicle_assignments 
DROP CONSTRAINT IF EXISTS vehicle_assignments_driver_id_fkey;

ALTER TABLE IF EXISTS public.refuel_records 
DROP CONSTRAINT IF EXISTS refuel_records_driver_id_fkey;

-- Update drivers table structure to match existing data
-- Keep the existing integer ID structure for drivers table
-- Add proper relationships

-- Ensure drivers table has proper structure
ALTER TABLE public.drivers 
ALTER COLUMN id TYPE INTEGER USING id::INTEGER;

-- Add sequence for drivers table if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS drivers_id_seq;
ALTER TABLE public.drivers ALTER COLUMN id SET DEFAULT nextval('drivers_id_seq');
ALTER SEQUENCE drivers_id_seq OWNED BY public.drivers.id;

-- Update vehicle_assignments to use integer driver_id to match drivers table
ALTER TABLE public.vehicle_assignments 
ALTER COLUMN driver_id TYPE INTEGER USING driver_id::INTEGER;

-- Add proper foreign key constraints
ALTER TABLE public.refuel_records 
ADD CONSTRAINT refuel_records_driver_id_fkey 
FOREIGN KEY (driver_id) REFERENCES public.drivers(id);

ALTER TABLE public.vehicle_assignments 
ADD CONSTRAINT vehicle_assignments_driver_id_fkey 
FOREIGN KEY (driver_id) REFERENCES public.drivers(id);

-- Add missing columns to drivers table if they don't exist
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS internal_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS license_expiry DATE,
ADD COLUMN IF NOT EXISTS medical_certificate_expiry DATE,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update timestamps
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
