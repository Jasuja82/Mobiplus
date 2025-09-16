-- Migration to align refuel_records table with CSV structure
-- This script updates the database to match the expected CSV import format

-- First, let's see what we're working with
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'refuel_records' 
ORDER BY ordinal_position;

-- Create a new refuel table that matches the CSV structure
DROP TABLE IF EXISTS refuel_records_new CASCADE;

CREATE TABLE refuel_records_new (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    afectacao VARCHAR REFERENCES assignments(id), -- assignment reference
    calculatedTotalLiterCost NUMERIC(10,2), -- calculated field from liters * literCost
    created TIMESTAMPTZ DEFAULT NOW(),
    data DATE NOT NULL, -- refuel date (renamed from refuel_date)
    driver VARCHAR REFERENCES drivers(id), -- driver reference
    literCost NUMERIC(6,3) NOT NULL, -- cost per liter (renamed from cost_per_liter)
    liters NUMERIC(8,2) NOT NULL, -- liters amount
    local VARCHAR REFERENCES locations(id), -- location reference (fuel station location)
    notes TEXT,
    odometer VARCHAR, -- odometer reading as string to match CSV
    updated TIMESTAMPTZ DEFAULT NOW(),
    viatura VARCHAR REFERENCES vehicles(id), -- vehicle reference
    calculatedOdometerDifference VARCHAR -- calculated field for odometer difference
);

-- Create indexes for performance
CREATE INDEX idx_refuel_records_new_viatura ON refuel_records_new(viatura);
CREATE INDEX idx_refuel_records_new_driver ON refuel_records_new(driver);
CREATE INDEX idx_refuel_records_new_data ON refuel_records_new(data);
CREATE INDEX idx_refuel_records_new_afectacao ON refuel_records_new(afectacao);
CREATE INDEX idx_refuel_records_new_local ON refuel_records_new(local);

-- Migrate existing data from old table to new structure
INSERT INTO refuel_records_new (
    id,
    viatura,
    driver,
    data,
    odometer,
    liters,
    literCost,
    calculatedTotalLiterCost,
    notes,
    created,
    updated
)
SELECT 
    id,
    vehicle_id as viatura,
    driver_id as driver,
    refuel_date::date as data,
    odometer_reading::text as odometer,
    liters,
    cost_per_liter as literCost,
    total_cost as calculatedTotalLiterCost,
    notes,
    created_at as created,
    updated_at as updated
FROM refuel_records
WHERE vehicle_id IS NOT NULL AND driver_id IS NOT NULL;

-- Drop the old table and rename the new one
DROP TABLE IF EXISTS refuel_records CASCADE;
ALTER TABLE refuel_records_new RENAME TO refuel_records;

-- Create a view that provides both old and new column names for backward compatibility
CREATE OR REPLACE VIEW refuel_analytics AS
SELECT 
    id,
    viatura as vehicle_id,
    driver as driver_id,
    afectacao as assignment_id,
    local as location_id,
    data as refuel_date,
    odometer::integer as odometer_reading,
    liters,
    literCost as cost_per_liter,
    calculatedTotalLiterCost as total_cost,
    calculatedOdometerDifference::integer as odometer_difference,
    notes,
    created as created_at,
    updated as updated_at,
    -- Join with related tables for display
    v.license_plate,
    v.vehicle_number,
    v.internal_number as vehicle_internal_number,
    d.full_name as driver_name,
    d.code as driver_code,
    l.name as location_name,
    a.name as assignment_name
FROM refuel_records r
LEFT JOIN vehicles v ON r.viatura = v.id
LEFT JOIN drivers d ON r.driver = d.id  
LEFT JOIN locations l ON r.local = l.id
LEFT JOIN assignments a ON r.afectacao = a.id;

-- Create triggers to automatically calculate derived fields
CREATE OR REPLACE FUNCTION calculate_refuel_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total cost
    NEW.calculatedTotalLiterCost = NEW.liters * NEW.literCost;
    
    -- Calculate odometer difference (if we have previous record)
    IF NEW.odometer IS NOT NULL AND NEW.odometer ~ '^[0-9]+$' THEN
        WITH previous_record AS (
            SELECT odometer::integer as prev_odometer
            FROM refuel_records 
            WHERE viatura = NEW.viatura 
              AND data < NEW.data 
              AND odometer IS NOT NULL 
              AND odometer ~ '^[0-9]+$'
            ORDER BY data DESC 
            LIMIT 1
        )
        SELECT CASE 
            WHEN prev_odometer IS NOT NULL THEN (NEW.odometer::integer - prev_odometer)::text
            ELSE NULL
        END INTO NEW.calculatedOdometerDifference
        FROM previous_record;
    END IF;
    
    -- Update timestamps
    IF TG_OP = 'INSERT' THEN
        NEW.created = NOW();
    END IF;
    NEW.updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_calculate_refuel_fields ON refuel_records;
CREATE TRIGGER trigger_calculate_refuel_fields
    BEFORE INSERT OR UPDATE ON refuel_records
    FOR EACH ROW EXECUTE FUNCTION calculate_refuel_fields();

-- Grant permissions
GRANT ALL ON refuel_records TO postgres;
GRANT SELECT ON refuel_analytics TO postgres;

-- Verify the migration
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT viatura) as unique_vehicles,
    COUNT(DISTINCT driver) as unique_drivers,
    MIN(data) as earliest_date,
    MAX(data) as latest_date
FROM refuel_records;

COMMENT ON TABLE refuel_records IS 'Refuel records table aligned with CSV import structure';
COMMENT ON VIEW refuel_analytics IS 'Backward compatibility view providing both old and new column names';
