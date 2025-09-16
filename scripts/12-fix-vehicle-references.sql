-- Fix the generate_string_id function and simplify refuel_records table
-- This script addresses the column reference errors and creates the simplified structure

-- First, fix the generate_string_id function
CREATE OR REPLACE FUNCTION generate_string_id(prefix TEXT)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    table_name TEXT;
BEGIN
    -- Determine table name based on prefix
    table_name := CASE prefix
        WHEN 'VEH' THEN 'vehicles'
        WHEN 'DRV' THEN 'drivers'
        WHEN 'DEP' THEN 'departments'
        WHEN 'LOC' THEN 'locations'
        WHEN 'REF' THEN 'refuel_records'
        WHEN 'ASG' THEN 'assignments'
        WHEN 'FST' THEN 'fuel_stations'
        ELSE 'generic'
    END;
    
    -- Get next sequence number
    EXECUTE format('SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1 FROM %I WHERE id LIKE %L', 
                   table_name, prefix || '_%')
    INTO next_num;
    
    -- Return formatted ID
    RETURN prefix || '_' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Drop existing views that depend on refuel_records
DROP VIEW IF EXISTS refuel_analytics CASCADE;
DROP VIEW IF EXISTS vehicle_fuel_efficiency CASCADE;
DROP VIEW IF EXISTS monthly_fuel_costs CASCADE;

-- Backup existing refuel_records data
CREATE TABLE IF NOT EXISTS refuel_records_backup AS 
SELECT * FROM refuel_records;

-- Drop and recreate refuel_records with simplified structure
DROP TABLE IF EXISTS refuel_records CASCADE;

CREATE TABLE refuel_records (
    id VARCHAR(20) PRIMARY KEY DEFAULT generate_string_id('REF'),
    vehicle_id VARCHAR(20) NOT NULL REFERENCES vehicles(id),
    driver_id VARCHAR(20) NOT NULL REFERENCES drivers(id),
    fuel_station_id VARCHAR(20) NOT NULL REFERENCES fuel_stations(id),
    refuel_date DATE NOT NULL,
    odometer_reading INTEGER NOT NULL,
    liters DECIMAL(8,2) NOT NULL,
    cost_per_liter DECIMAL(6,3) NOT NULL,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (liters * cost_per_liter) STORED,
    odometer_difference INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to calculate odometer difference
CREATE OR REPLACE FUNCTION calculate_odometer_difference(
    p_vehicle_id VARCHAR(20),
    p_refuel_date DATE,
    p_odometer_reading INTEGER
) RETURNS INTEGER AS $$
DECLARE
    previous_reading INTEGER;
BEGIN
    -- Get the most recent odometer reading before this refuel
    SELECT odometer_reading INTO previous_reading
    FROM refuel_records 
    WHERE vehicle_id = p_vehicle_id 
      AND refuel_date < p_refuel_date
    ORDER BY refuel_date DESC, created_at DESC
    LIMIT 1;
    
    -- If no previous reading found, check vehicle's current_mileage
    IF previous_reading IS NULL THEN
        SELECT current_mileage INTO previous_reading
        FROM vehicles 
        WHERE id = p_vehicle_id;
    END IF;
    
    -- Return difference or null if no previous reading
    RETURN CASE 
        WHEN previous_reading IS NOT NULL THEN p_odometer_reading - previous_reading
        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate odometer_difference
CREATE OR REPLACE FUNCTION update_odometer_difference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.odometer_difference := calculate_odometer_difference(
        NEW.vehicle_id,
        NEW.refuel_date,
        NEW.odometer_reading
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_odometer_difference
    BEFORE INSERT OR UPDATE ON refuel_records
    FOR EACH ROW
    EXECUTE FUNCTION update_odometer_difference();

-- Create comprehensive refuel analytics view
CREATE VIEW refuel_analytics AS
SELECT 
    r.id,
    r.refuel_date,
    r.odometer_reading,
    r.liters,
    r.cost_per_liter,
    r.total_cost,
    r.odometer_difference,
    r.notes,
    -- Vehicle information
    v.license_plate as vehicle_number,
    v.internal_number,
    COALESCE(mk.name, 'Unknown') as vehicle_make,
    COALESCE(md.name, 'Unknown') as vehicle_model,
    vd.year as vehicle_year,
    -- Driver information
    d.full_name as driver_name,
    d.code as driver_code,
    -- Fuel station information
    fs.name as fuel_station_name,
    fs.brand as fuel_station_brand,
    -- Location information
    loc.name as location_name,
    loc.city,
    loc.region,
    -- Department information
    dept.name as department_name,
    -- Calculated fields
    CASE 
        WHEN r.odometer_difference > 0 AND r.liters > 0 
        THEN ROUND((r.liters * 100.0 / r.odometer_difference)::NUMERIC, 2)
        ELSE NULL
    END as fuel_efficiency_l_per_100km,
    CASE 
        WHEN r.odometer_difference > 0 AND r.liters > 0 
        THEN ROUND((r.odometer_difference / r.liters)::NUMERIC, 2)
        ELSE NULL
    END as km_per_liter,
    CASE 
        WHEN r.odometer_difference > 0 
        THEN ROUND((r.total_cost / r.odometer_difference)::NUMERIC, 3)
        ELSE NULL
    END as cost_per_km
FROM refuel_records r
JOIN vehicles v ON r.vehicle_id = v.id
JOIN drivers d ON r.driver_id = d.id
JOIN fuel_stations fs ON r.fuel_station_id = fs.id
LEFT JOIN vehicle_details vd ON v.vehicle_details_id = vd.id
LEFT JOIN makes mk ON vd.make_id = mk.id
LEFT JOIN models md ON vd.model_id = md.id
LEFT JOIN locations loc ON v.current_location_id = loc.id
LEFT JOIN departments dept ON v.department_id = dept.id;

-- Create monthly fuel summary view
CREATE VIEW monthly_fuel_summary AS
SELECT 
    DATE_TRUNC('month', refuel_date) as month,
    vehicle_number,
    vehicle_make,
    vehicle_model,
    department_name,
    COUNT(*) as total_refuels,
    SUM(liters) as total_liters,
    SUM(total_cost) as total_cost,
    SUM(odometer_difference) as total_distance,
    AVG(cost_per_liter) as avg_cost_per_liter,
    AVG(fuel_efficiency_l_per_100km) as avg_fuel_efficiency,
    AVG(cost_per_km) as avg_cost_per_km
FROM refuel_analytics
WHERE odometer_difference IS NOT NULL
GROUP BY 
    DATE_TRUNC('month', refuel_date),
    vehicle_number,
    vehicle_make,
    vehicle_model,
    department_name
ORDER BY month DESC, vehicle_number;

-- Create vehicle fuel efficiency ranking view
CREATE VIEW vehicle_fuel_efficiency_ranking AS
SELECT 
    vehicle_number,
    vehicle_make,
    vehicle_model,
    department_name,
    COUNT(*) as total_refuels,
    AVG(fuel_efficiency_l_per_100km) as avg_fuel_efficiency,
    AVG(cost_per_km) as avg_cost_per_km,
    SUM(total_cost) as total_fuel_cost,
    SUM(odometer_difference) as total_distance,
    RANK() OVER (ORDER BY AVG(fuel_efficiency_l_per_100km) ASC) as efficiency_rank
FROM refuel_analytics
WHERE fuel_efficiency_l_per_100km IS NOT NULL
GROUP BY vehicle_number, vehicle_make, vehicle_model, department_name
ORDER BY avg_fuel_efficiency ASC;

-- Create indexes for better performance
CREATE INDEX idx_refuel_records_vehicle_date ON refuel_records(vehicle_id, refuel_date);
CREATE INDEX idx_refuel_records_driver ON refuel_records(driver_id);
CREATE INDEX idx_refuel_records_fuel_station ON refuel_records(fuel_station_id);
CREATE INDEX idx_refuel_records_date ON refuel_records(refuel_date);

-- Enable Row Level Security
ALTER TABLE refuel_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic example - adjust based on your auth requirements)
CREATE POLICY "Users can view refuel records" ON refuel_records
    FOR SELECT USING (true);

CREATE POLICY "Users can insert refuel records" ON refuel_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update refuel records" ON refuel_records
    FOR UPDATE USING (true);

-- Insert sample data to test the structure
INSERT INTO refuel_records (
    vehicle_id, 
    driver_id, 
    fuel_station_id, 
    refuel_date, 
    odometer_reading, 
    liters, 
    cost_per_liter,
    notes
) 
SELECT 
    v.id,
    d.id,
    fs.id,
    CURRENT_DATE - INTERVAL '30 days',
    50000,
    45.5,
    1.45,
    'Test refuel record'
FROM vehicles v
CROSS JOIN drivers d
CROSS JOIN fuel_stations fs
LIMIT 1;

-- Verify the structure works
SELECT 'Refuel records table created successfully' as status;
SELECT COUNT(*) as total_records FROM refuel_records;
SELECT COUNT(*) as analytics_view_records FROM refuel_analytics;
