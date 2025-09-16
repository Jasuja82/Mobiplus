-- Test script to verify the new string-based ID schema is working correctly

-- Test 1: Insert test data with string IDs
INSERT INTO departments (id, name, description) VALUES 
('DEPT_000001', 'Operations', 'Main operations department'),
('DEPT_000002', 'Maintenance', 'Vehicle maintenance department');

INSERT INTO locations (id, name, address, city, postal_code, country) VALUES 
('LOC_000001', 'Main Depot', '123 Fleet Street', 'Ponta Delgada', '9500-123', 'Portugal'),
('LOC_000002', 'North Station', '456 North Ave', 'Ribeira Grande', '9600-456', 'Portugal');

INSERT INTO makes (id, name) VALUES 
('MAKE_000001', 'Toyota'),
('MAKE_000002', 'Ford');

INSERT INTO models (id, make_id, name, year) VALUES 
('MODEL_000001', 'MAKE_000001', 'Corolla', 2023),
('MODEL_000002', 'MAKE_000002', 'Transit', 2022);

INSERT INTO engine_types (id, name, fuel_type, displacement) VALUES 
('ENG_000001', '1.8L Hybrid', 'Hybrid', 1.8),
('ENG_000002', '2.0L Diesel', 'Diesel', 2.0);

INSERT INTO license_types (id, name, description) VALUES 
('LIC_000001', 'Category B', 'Standard car license'),
('LIC_000002', 'Category C', 'Truck license');

INSERT INTO employees (id, name, email, phone, department_id) VALUES 
('EMP_000001', 'João Silva', 'joao@mobiazores.pt', '+351 912 345 678', 'DEPT_000001'),
('EMP_000002', 'Maria Santos', 'maria@mobiazores.pt', '+351 913 456 789', 'DEPT_000002');

INSERT INTO drivers (id, employee_id, license_number, license_type_id, license_expiry_date, status) VALUES 
('DRV_000001', 'EMP_000001', 'PT123456789', 'LIC_000001', '2025-12-31', 'active'),
('DRV_000002', 'EMP_000002', 'PT987654321', 'LIC_000002', '2026-06-30', 'active');

INSERT INTO vehicles (id, license_plate, make_id, model_id, year, engine_type_id, fuel_capacity, current_odometer, status, location_id) VALUES 
('VEH_000001', 'AA-12-34', 'MAKE_000001', 'MODEL_000001', 2023, 'ENG_000001', 50.0, 15000, 'active', 'LOC_000001'),
('VEH_000002', 'BB-56-78', 'MAKE_000002', 'MODEL_000002', 2022, 'ENG_000002', 80.0, 25000, 'active', 'LOC_000002');

INSERT INTO fuel_stations (id, name, address, city, postal_code, country, fuel_types) VALUES 
('FS_000001', 'Galp Ponta Delgada', 'Av. Marginal', 'Ponta Delgada', '9500-789', 'Portugal', ARRAY['gasoline', 'diesel']),
('FS_000002', 'BP Ribeira Grande', 'Rua Principal', 'Ribeira Grande', '9600-123', 'Portugal', ARRAY['diesel', 'hybrid']);

INSERT INTO assignments (id, vehicle_id, driver_id, start_date, assignment_type, status) VALUES 
('ASG_000001', 'VEH_000001', 'DRV_000001', CURRENT_DATE, 'permanent', 'active'),
('ASG_000002', 'VEH_000002', 'DRV_000002', CURRENT_DATE, 'temporary', 'active');

INSERT INTO fuel_price_per_month (id, fuel_type, price_per_liter, month, year) VALUES 
('FPM_000001', 'gasoline', 1.45, 12, 2024),
('FPM_000002', 'diesel', 1.35, 12, 2024),
('FPM_000003', 'hybrid', 1.40, 12, 2024);

-- Test 2: Insert refuel records (triggers should calculate efficiency automatically)
INSERT INTO refuel_records (id, vehicle_id, driver_id, fuel_station_id, fuel_type, liters_filled, cost_per_liter, total_cost, odometer_reading, refuel_date, receipt_number) VALUES 
('REF_000001', 'VEH_000001', 'DRV_000001', 'FS_000001', 'gasoline', 45.0, 1.45, 65.25, 15500, CURRENT_DATE, 'REC001'),
('REF_000002', 'VEH_000002', 'DRV_000002', 'FS_000002', 'diesel', 60.0, 1.35, 81.00, 25800, CURRENT_DATE, 'REC002');

-- Test 3: Verify the data was inserted correctly
SELECT 'Departments' as table_name, COUNT(*) as record_count FROM departments
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'Drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'Refuel Records', COUNT(*) FROM refuel_records
UNION ALL
SELECT 'Assignments', COUNT(*) FROM assignments;

-- Test 4: Verify string ID format
SELECT 
    'Vehicle IDs' as check_type,
    id,
    CASE 
        WHEN id ~ '^VEH_[0-9]{6}$' THEN 'Valid Format'
        ELSE 'Invalid Format'
    END as format_check
FROM vehicles
UNION ALL
SELECT 
    'Driver IDs',
    id,
    CASE 
        WHEN id ~ '^DRV_[0-9]{6}$' THEN 'Valid Format'
        ELSE 'Invalid Format'
    END
FROM drivers;

-- Test 5: Verify calculated fields in refuel records
SELECT 
    id,
    vehicle_id,
    odometer_reading,
    odometer_difference,
    fuel_efficiency,
    cost_per_km,
    CASE 
        WHEN fuel_efficiency > 0 THEN 'Calculation OK'
        ELSE 'Calculation Issue'
    END as calculation_status
FROM refuel_records;

-- Test 6: Test the summary views
SELECT 'Vehicle Summary View' as view_name, COUNT(*) as record_count FROM vehicle_summary
UNION ALL
SELECT 'Refuel Summary View', COUNT(*) FROM refuel_summary;

-- Test 7: Verify foreign key relationships
SELECT 
    v.id as vehicle_id,
    v.license_plate,
    m.name as make_name,
    mo.name as model_name,
    et.name as engine_type,
    l.name as location_name
FROM vehicles v
JOIN makes m ON v.make_id = m.id
JOIN models mo ON v.model_id = mo.id
JOIN engine_types et ON v.engine_type_id = et.id
JOIN locations l ON v.location_id = l.id;
