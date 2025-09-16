-- Fix location and department reference issues
-- Ensure proper foreign key constraints exist

-- Add missing location columns to vehicles table if they don't exist
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS home_location_id UUID REFERENCES public.locations(id),
ADD COLUMN IF NOT EXISTS current_location_id UUID REFERENCES public.locations(id);

-- Add missing location column to departments if it doesn't exist
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);

-- Ensure fuel_stations table exists and has proper location reference
CREATE TABLE IF NOT EXISTS public.fuel_stations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    address TEXT,
    location_id UUID REFERENCES public.locations(id),
    coordinates POINT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add fuel_station_id to refuel_records if it doesn't exist
ALTER TABLE public.refuel_records 
ADD COLUMN IF NOT EXISTS fuel_station_id UUID REFERENCES public.fuel_stations(id),
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);

-- Create indexes for better performance on location references
CREATE INDEX IF NOT EXISTS idx_vehicles_home_location ON public.vehicles(home_location_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_current_location ON public.vehicles(current_location_id);
CREATE INDEX IF NOT EXISTS idx_departments_location ON public.departments(location_id);
CREATE INDEX IF NOT EXISTS idx_fuel_stations_location ON public.fuel_stations(location_id);
CREATE INDEX IF NOT EXISTS idx_refuel_records_location ON public.refuel_records(location_id);
CREATE INDEX IF NOT EXISTS idx_refuel_records_fuel_station ON public.refuel_records(fuel_station_id);

-- Ensure locations table has proper structure
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS internal_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Portugal',
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS coordinates POINT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
