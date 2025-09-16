-- Simplify refuel_records table to only essential fields
-- Drop all analytics fields and keep only core data entry fields

BEGIN;

-- First, drop the existing refuel_records table and recreate with simplified structure
DROP TABLE IF EXISTS refuel_records CASCADE;

-- Create simplified refuel_records table with only essential fields
CREATE TABLE refuel_records (
    id VARCHAR(20) PRIMARY KEY DEFAULT generate_string_id('REF'),
    
    -- Core references
    vehicle_id VARCHAR(20) NOT NULL REFERENCES vehicles(id),
    driver_id VARCHAR(20) NOT NULL REFERENCES drivers(id),
    fuel_station_id VARCHAR(20) NOT NULL REFERENCES fuel_stations(id),
    
    -- Essential data fields
    refuel_date DATE NOT NULL,
    odometer_reading INTEGER NOT NULL,
    liters NUMERIC(8,2) NOT NULL,
    cost_per_liter NUMERIC(6,3) NOT NULL,
    total_cost NUMERIC(10,2) GENERATED ALWAYS AS (liters * cost_per_liter) STORED,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to calculate odometer difference
CREATE OR REPLACE FUNCTION calculate_odometer_difference(
    p_vehicle_id VARCHAR(20),
    p_current_reading INTEGER,
    p_refuel_date DATE
) RETURNS INTEGER AS $$
DECLARE
    previous_reading INTEGER;
BEGIN
    -- Get the most recent odometer reading before this refuel date
    SELECT odometer_reading INTO previous_reading
    FROM refuel_records 
    WHERE vehicle_id = p_vehicle_id 
    AND refuel_date < p_refuel_date
    ORDER BY refuel_date DESC, created_at DESC
    LIMIT 1;
    
    -- If no previous reading found, return 0
    IF previous_reading IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Return the difference
    RETURN p_current_reading - previous_reading;
END;
$$ LANGUAGE plpgsql;

-- Create comprehensive analytics view for refuel data
CREATE OR REPLACE VIEW refuel_analytics AS
SELECT 
    r.id,
    r.refuel_date,
    r.odometer_reading,
    r.liters,
    r.cost_per_liter,
    r.total_cost,
    r.notes,
    
    -- Vehicle information
    v.license_plate as numero_viatura,
    v.vehicle_number,
    
    -- Driver information  
    d.full_name as condutor,
    d.code as driver_code,
    
    -- Fuel station information
    fs.name as bomba,
    fs.brand as fuel_station_brand,
    
    -- Location information
    l.name as location_name,
    l.city,
    l.region,
    
    -- Department information
    dept.name as department_name,
    
    -- Calculated fields
    calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date) as distancia_percorrida,
    
    -- Fuel efficiency calculations (only if distance > 0)
    CASE 
        WHEN calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date) > 0 
        THEN ROUND((r.liters::NUMERIC / calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date)::NUMERIC) * 100, 2)
        ELSE NULL 
    END as fuel_efficiency_l_per_100km,
    
    CASE 
        WHEN calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date) > 0 
        THEN ROUND(calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date)::NUMERIC / r.liters, 2)
        ELSE NULL 
    END as km_per_liter,
    
    CASE 
        WHEN calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date) > 0 
        THEN ROUND(r.total_cost / calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date), 3)
        ELSE NULL 
    END as cost_per_km,
    
    r.created_at,
    r.updated_at

FROM refuel_records r
JOIN vehicles v ON r.vehicle_id = v.id
JOIN drivers d ON r.driver_id = d.id
JOIN fuel_stations fs ON r.fuel_station_id = fs.id
LEFT JOIN locations l ON v.current_location_id = l.id
LEFT JOIN departments dept ON v.department_id = dept.id
ORDER BY r.refuel_date DESC, r.created_at DESC;

-- Create monthly fuel summary view
CREATE OR REPLACE VIEW monthly_fuel_summary AS
SELECT 
    DATE_TRUNC('month', refuel_date) as month,
    v.license_plate,
    v.vehicle_number,
    d.full_name as driver_name,
    dept.name as department_name,
    COUNT(*) as total_refuels,
    SUM(r.liters) as total_liters,
    SUM(r.total_cost) as total_cost,
    AVG(r.cost_per_liter) as avg_cost_per_liter,
    SUM(calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date)) as total_distance,
    
    -- Average fuel efficiency for the month
    CASE 
        WHEN SUM(calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date)) > 0 
        THEN ROUND((SUM(r.liters) / SUM(calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date))) * 100, 2)
        ELSE NULL 
    END as avg_fuel_efficiency_l_per_100km

FROM refuel_records r
JOIN vehicles v ON r.vehicle_id = v.id
JOIN drivers d ON r.driver_id = d.id
LEFT JOIN departments dept ON v.department_id = dept.id
GROUP BY DATE_TRUNC('month', refuel_date), v.license_plate, v.vehicle_number, d.full_name, dept.name
ORDER BY month DESC, v.license_plate;

-- Create department fuel analytics view
CREATE OR REPLACE VIEW department_fuel_analytics AS
SELECT 
    dept.name as department_name,
    DATE_TRUNC('month', r.refuel_date) as month,
    COUNT(DISTINCT r.vehicle_id) as active_vehicles,
    COUNT(*) as total_refuels,
    SUM(r.liters) as total_liters,
    SUM(r.total_cost) as total_cost,
    AVG(r.cost_per_liter) as avg_cost_per_liter,
    SUM(calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date)) as total_distance,
    
    -- Department average fuel efficiency
    CASE 
        WHEN SUM(calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date)) > 0 
        THEN ROUND((SUM(r.liters) / SUM(calculate_odometer_difference(r.vehicle_id, r.odometer_reading, r.refuel_date))) * 100, 2)
        ELSE NULL 
    END as avg_fuel_efficiency_l_per_100km

FROM refuel_records r
JOIN vehicles v ON r.vehicle_id = v.id
JOIN departments dept ON v.department_id = dept.id
GROUP BY dept.name, DATE_TRUNC('month', r.refuel_date)
ORDER BY month DESC, dept.name;

-- Create indexes for better performance
CREATE INDEX idx_refuel_records_vehicle_date ON refuel_records(vehicle_id, refuel_date);
CREATE INDEX idx_refuel_records_driver_date ON refuel_records(driver_id, refuel_date);
CREATE INDEX idx_refuel_records_fuel_station ON refuel_records(fuel_station_id);
CREATE INDEX idx_refuel_records_date ON refuel_records(refuel_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_refuel_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_refuel_records_updated_at
    BEFORE UPDATE ON refuel_records
    FOR EACH ROW
    EXECUTE FUNCTION update_refuel_records_updated_at();

-- Enable RLS
ALTER TABLE refuel_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON refuel_records
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON refuel_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON refuel_records
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON refuel_records
    FOR DELETE USING (true);

COMMIT;

-- Test the new structure with sample data
INSERT INTO refuel_records (vehicle_id, driver_id, fuel_station_id, refuel_date, odometer_reading, liters, cost_per_liter, notes)
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

-- Verify the analytics view works
SELECT * FROM refuel_analytics LIMIT 5;
