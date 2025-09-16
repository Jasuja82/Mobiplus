-- Comprehensive database sanitization and validation script
-- This script fixes data inconsistencies and validates the database structure

-- 1. Fix odometer progression issues
DO $$
DECLARE
    vehicle_record RECORD;
    refuel_record RECORD;
    prev_odometer INTEGER := 0;
    prev_date DATE;
    fixed_count INTEGER := 0;
BEGIN
    -- Process each vehicle separately
    FOR vehicle_record IN 
        SELECT DISTINCT vehicle_id FROM refuel_records 
        WHERE vehicle_id IS NOT NULL
        ORDER BY vehicle_id
    LOOP
        prev_odometer := 0;
        prev_date := NULL;
        
        -- Process refuel records for this vehicle in chronological order
        FOR refuel_record IN
            SELECT id, refuel_date, odometer_reading, odometer_difference
            FROM refuel_records 
            WHERE vehicle_id = vehicle_record.vehicle_id
            ORDER BY refuel_date ASC, odometer_reading ASC
        LOOP
            -- Calculate correct odometer difference
            IF prev_odometer > 0 THEN
                DECLARE
                    calculated_diff INTEGER := refuel_record.odometer_reading - prev_odometer;
                BEGIN
                    -- Update if different from stored value
                    IF refuel_record.odometer_difference != calculated_diff THEN
                        UPDATE refuel_records 
                        SET odometer_difference = calculated_diff,
                            updated_at = NOW()
                        WHERE id = refuel_record.id;
                        
                        fixed_count := fixed_count + 1;
                    END IF;
                END;
            ELSE
                -- First record for vehicle, set difference to 0
                UPDATE refuel_records 
                SET odometer_difference = 0,
                    updated_at = NOW()
                WHERE id = refuel_record.id;
            END IF;
            
            prev_odometer := refuel_record.odometer_reading;
            prev_date := refuel_record.refuel_date::DATE;
        END LOOP;
    END LOOP;
END $$;

-- 2. Update vehicle current mileage to latest odometer reading
UPDATE vehicles 
SET current_mileage = latest_readings.max_odometer,
    updated_at = NOW()
FROM (
    SELECT 
        vehicle_id,
        MAX(odometer_reading) as max_odometer
    FROM refuel_records 
    WHERE odometer_reading > 0
    GROUP BY vehicle_id
) latest_readings
WHERE vehicles.id = latest_readings.vehicle_id
AND vehicles.current_mileage < latest_readings.max_odometer;

-- 3. Fix assignment types references
-- Update assignments to use valid assignment type names
UPDATE assignments 
SET type = 'Regular Service'
WHERE type IS NULL 
   OR type NOT IN (SELECT name FROM assignment_types);

-- 4. Clean up fuel price anomalies (prices outside reasonable range)
UPDATE refuel_records 
SET cost_per_liter = (
    SELECT AVG(cost_per_liter) 
    FROM refuel_records r2 
    WHERE r2.refuel_date::DATE = refuel_records.refuel_date::DATE
    AND r2.cost_per_liter BETWEEN 0.8 AND 2.5
    AND r2.id != refuel_records.id
)
WHERE cost_per_liter < 0.5 OR cost_per_liter > 3.0;

-- Recalculate total cost for corrected records
UPDATE refuel_records 
SET total_cost = liters * cost_per_liter,
    updated_at = NOW()
WHERE total_cost != (liters * cost_per_liter);

-- 5. Validate and fix vehicle statuses
UPDATE vehicles 
SET status = 'active'
WHERE status IS NULL;

-- Set vehicles to maintenance if they have recent maintenance schedules
UPDATE vehicles 
SET status = 'maintenance',
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT vehicle_id 
    FROM maintenance_schedules 
    WHERE status IN ('in_progress', 'scheduled')
    AND scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
);

-- 6. Clean up orphaned records
-- Remove refuel records without valid vehicle references
DELETE FROM refuel_records 
WHERE vehicle_id NOT IN (SELECT id FROM vehicles);

-- Remove refuel records without valid driver references
DELETE FROM refuel_records 
WHERE driver_id NOT IN (SELECT id FROM drivers);

-- 7. Ensure data consistency
-- Fix negative liters
UPDATE refuel_records 
SET liters = ABS(liters)
WHERE liters < 0;

-- Fix zero or negative costs
UPDATE refuel_records 
SET cost_per_liter = 1.5,
    total_cost = liters * 1.5
WHERE cost_per_liter <= 0;

-- 8. Create data quality report
CREATE OR REPLACE VIEW data_quality_report AS
SELECT 
    'Refuel Records' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE odometer_difference < 0) as negative_mileage,
    COUNT(*) FILTER (WHERE odometer_difference > 1500) as high_mileage_jump,
    COUNT(*) FILTER (WHERE liters > 200) as high_fuel_volume,
    COUNT(*) FILTER (WHERE cost_per_liter < 0.8 OR cost_per_liter > 2.5) as unusual_fuel_price,
    COUNT(*) FILTER (WHERE vehicle_id IS NULL) as missing_vehicle,
    COUNT(*) FILTER (WHERE driver_id IS NULL) as missing_driver,
    ROUND(AVG(liters), 2) as avg_liters,
    ROUND(AVG(cost_per_liter), 3) as avg_cost_per_liter,
    MIN(refuel_date) as earliest_date,
    MAX(refuel_date) as latest_date
FROM refuel_records

UNION ALL

SELECT 
    'Vehicles' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status IS NULL) as null_status,
    COUNT(*) FILTER (WHERE current_mileage < 0) as negative_mileage,
    COUNT(*) FILTER (WHERE current_mileage > 1000000) as high_mileage,
    COUNT(*) FILTER (WHERE license_plate IS NULL) as missing_license_plate,
    COUNT(*) FILTER (WHERE department_id IS NULL) as missing_department,
    0 as unused_field,
    0 as avg_liters,
    0 as avg_cost_per_liter,
    MIN(created_at) as earliest_date,
    MAX(updated_at) as latest_date
FROM vehicles

UNION ALL

SELECT 
    'Drivers' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE full_name IS NULL) as missing_name,
    COUNT(*) FILTER (WHERE code IS NULL) as missing_code,
    COUNT(*) FILTER (WHERE is_active IS NULL) as null_active_status,
    0 as unused_field1,
    0 as unused_field2,
    0 as unused_field3,
    0 as avg_liters,
    0 as avg_cost_per_liter,
    MIN(created_at) as earliest_date,
    MAX(updated_at) as latest_date
FROM drivers;

-- 9. Update statistics
ANALYZE refuel_records;
ANALYZE vehicles;
ANALYZE drivers;
ANALYZE assignment_types;
ANALYZE departments;
ANALYZE maintenance_schedules;

-- 10. Final validation queries
-- Check for remaining data quality issues
SELECT 'Data Quality Summary' as report_type;

SELECT 
    table_name,
    total_records,
    negative_mileage + high_mileage_jump + high_fuel_volume + unusual_fuel_price + missing_vehicle + missing_driver as total_issues,
    ROUND(
        (negative_mileage + high_mileage_jump + high_fuel_volume + unusual_fuel_price + missing_vehicle + missing_driver)::NUMERIC 
        / NULLIF(total_records, 0) * 100, 2
    ) as issue_percentage
FROM data_quality_report
ORDER BY total_records DESC;

-- Show sample of remaining problematic records
SELECT 'Remaining Issues Sample' as report_type;

SELECT 
    r.id,
    r.refuel_date,
    v.license_plate,
    d.full_name as driver_name,
    r.odometer_reading,
    r.odometer_difference,
    r.liters,
    r.cost_per_liter,
    CASE 
        WHEN r.odometer_difference < 0 THEN 'Negative Mileage'
        WHEN r.odometer_difference > 1500 THEN 'High Mileage Jump'
        WHEN r.liters > 200 THEN 'High Fuel Volume'
        WHEN r.cost_per_liter < 0.8 OR r.cost_per_liter > 2.5 THEN 'Unusual Fuel Price'
        ELSE 'Other'
    END as issue_type
FROM refuel_records r
LEFT JOIN vehicles v ON r.vehicle_id = v.id
LEFT JOIN drivers d ON r.driver_id = d.id
WHERE r.odometer_difference < 0 
   OR r.odometer_difference > 1500 
   OR r.liters > 200 
   OR r.cost_per_liter < 0.8 
   OR r.cost_per_liter > 2.5
ORDER BY r.refuel_date DESC
LIMIT 20;
