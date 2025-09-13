-- Enhanced schema for MobiAzores fleet management with analytics support

-- Add locations table for better location management
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Portugal',
  coordinates POINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add fuel_stations table for better fuel station management
CREATE TABLE IF NOT EXISTS fuel_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  location_id UUID REFERENCES locations(id),
  address TEXT,
  coordinates POINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance refuel_records table with calculated fields and better structure
ALTER TABLE refuel_records 
ADD COLUMN IF NOT EXISTS fuel_station_id UUID REFERENCES fuel_stations(id),
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id),
ADD COLUMN IF NOT EXISTS odometer_reading INTEGER,
ADD COLUMN IF NOT EXISTS distance_since_last_refuel INTEGER,
ADD COLUMN IF NOT EXISTS fuel_efficiency_l_per_100km NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS cost_per_km NUMERIC(8,4),
ADD COLUMN IF NOT EXISTS km_per_liter NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS is_full_tank BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_refuel_records_vehicle_date ON refuel_records(vehicle_id, refuel_date);
CREATE INDEX IF NOT EXISTS idx_refuel_records_driver_date ON refuel_records(driver_id, refuel_date);
CREATE INDEX IF NOT EXISTS idx_refuel_records_location ON refuel_records(location_id);
CREATE INDEX IF NOT EXISTS idx_refuel_records_fuel_station ON refuel_records(fuel_station_id);

-- Add department location relationship
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Add vehicle location tracking
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS current_location_id UUID REFERENCES locations(id),
ADD COLUMN IF NOT EXISTS home_location_id UUID REFERENCES locations(id);

-- Create analytics views for better performance

-- Monthly fuel analytics by vehicle
CREATE OR REPLACE VIEW monthly_fuel_analytics_by_vehicle AS
SELECT 
  v.id as vehicle_id,
  v.license_plate,
  v.make,
  v.model,
  d.name as department_name,
  l.name as location_name,
  DATE_TRUNC('month', r.refuel_date) as month,
  COUNT(*) as refuel_count,
  SUM(r.liters) as total_liters,
  SUM(r.total_cost) as total_cost,
  AVG(r.cost_per_liter) as avg_cost_per_liter,
  SUM(r.distance_since_last_refuel) as total_distance,
  AVG(r.fuel_efficiency_l_per_100km) as avg_fuel_efficiency,
  AVG(r.cost_per_km) as avg_cost_per_km,
  AVG(r.km_per_liter) as avg_km_per_liter,
  MAX(r.odometer_reading) - MIN(r.odometer_reading) as odometer_difference
FROM refuel_records r
JOIN vehicles v ON r.vehicle_id = v.id
LEFT JOIN departments d ON v.department_id = d.id
LEFT JOIN locations l ON r.location_id = l.id
WHERE r.refuel_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY v.id, v.license_plate, v.make, v.model, d.name, l.name, DATE_TRUNC('month', r.refuel_date);

-- Department fuel analytics
CREATE OR REPLACE VIEW department_fuel_analytics AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  DATE_TRUNC('month', r.refuel_date) as month,
  COUNT(DISTINCT r.vehicle_id) as active_vehicles,
  COUNT(*) as total_refuels,
  SUM(r.liters) as total_liters,
  SUM(r.total_cost) as total_cost,
  AVG(r.cost_per_liter) as avg_cost_per_liter,
  SUM(r.distance_since_last_refuel) as total_distance,
  AVG(r.fuel_efficiency_l_per_100km) as avg_fuel_efficiency,
  AVG(r.cost_per_km) as avg_cost_per_km
FROM refuel_records r
JOIN vehicles v ON r.vehicle_id = v.id
JOIN departments d ON v.department_id = d.id
WHERE r.refuel_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY d.id, d.name, DATE_TRUNC('month', r.refuel_date);

-- Fleet performance summary
CREATE OR REPLACE VIEW fleet_performance_summary AS
SELECT 
  DATE_TRUNC('month', r.refuel_date) as month,
  COUNT(DISTINCT r.vehicle_id) as active_vehicles,
  COUNT(DISTINCT r.driver_id) as active_drivers,
  COUNT(*) as total_refuels,
  SUM(r.liters) as total_liters,
  SUM(r.total_cost) as total_cost,
  AVG(r.cost_per_liter) as avg_cost_per_liter,
  SUM(r.distance_since_last_refuel) as total_distance,
  CASE 
    WHEN SUM(r.distance_since_last_refuel) > 0 
    THEN (SUM(r.liters) / SUM(r.distance_since_last_refuel)) * 100 
    ELSE NULL 
  END as fleet_avg_l_per_100km,
  CASE 
    WHEN SUM(r.distance_since_last_refuel) > 0 
    THEN SUM(r.total_cost) / SUM(r.distance_since_last_refuel) 
    ELSE NULL 
  END as fleet_avg_cost_per_km
FROM refuel_records r
WHERE r.refuel_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '24 months')
GROUP BY DATE_TRUNC('month', r.refuel_date)
ORDER BY month DESC;

-- Function to calculate distance since last refuel
CREATE OR REPLACE FUNCTION calculate_distance_since_last_refuel()
RETURNS TRIGGER AS $$
DECLARE
  last_odometer INTEGER;
BEGIN
  -- Get the last odometer reading for this vehicle
  SELECT odometer_reading INTO last_odometer
  FROM refuel_records 
  WHERE vehicle_id = NEW.vehicle_id 
    AND refuel_date < NEW.refuel_date
    AND odometer_reading IS NOT NULL
  ORDER BY refuel_date DESC, created_at DESC
  LIMIT 1;
  
  -- Calculate distance if we have a previous reading
  IF last_odometer IS NOT NULL AND NEW.odometer_reading IS NOT NULL THEN
    NEW.distance_since_last_refuel := NEW.odometer_reading - last_odometer;
    
    -- Calculate fuel efficiency (L/100km)
    IF NEW.distance_since_last_refuel > 0 AND NEW.liters > 0 THEN
      NEW.fuel_efficiency_l_per_100km := (NEW.liters / NEW.distance_since_last_refuel) * 100;
      NEW.km_per_liter := NEW.distance_since_last_refuel / NEW.liters;
    END IF;
    
    -- Calculate cost per km
    IF NEW.distance_since_last_refuel > 0 AND NEW.total_cost > 0 THEN
      NEW.cost_per_km := NEW.total_cost / NEW.distance_since_last_refuel;
    END IF;
  END IF;
  
  -- Calculate total cost if not provided
  IF NEW.total_cost IS NULL AND NEW.liters IS NOT NULL AND NEW.cost_per_liter IS NOT NULL THEN
    NEW.total_cost := NEW.liters * NEW.cost_per_liter;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic calculations
DROP TRIGGER IF EXISTS calculate_refuel_metrics ON refuel_records;
CREATE TRIGGER calculate_refuel_metrics
  BEFORE INSERT OR UPDATE ON refuel_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_distance_since_last_refuel();

-- Update existing records to have mileage as odometer_reading if not set
UPDATE refuel_records 
SET odometer_reading = mileage 
WHERE odometer_reading IS NULL AND mileage IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_stations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for locations
CREATE POLICY "Users can view all locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage locations" ON locations FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for fuel_stations
CREATE POLICY "Users can view all fuel stations" ON fuel_stations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage fuel stations" ON fuel_stations FOR ALL USING (auth.role() = 'authenticated');
