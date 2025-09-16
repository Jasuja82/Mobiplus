-- Safe test script with proper foreign key constraint handling

-- Test 1: Clear existing test data in correct order (child records first)
DELETE FROM refuel_records WHERE id LIKE 'REF_0000%';
DELETE FROM assignments WHERE id LIKE 'ASG_0000%';
DELETE FROM fuel_price_per_month WHERE id LIKE 'FPM_0000%';
DELETE FROM vehicles WHERE id LIKE 'VEH_0000%';
DELETE FROM drivers WHERE id LIKE 'DRV_0000%';
DELETE FROM employees WHERE id LIKE 'EMP_0000%';
DELETE FROM fuel_stations WHERE id LIKE 'FS_0000%';
DELETE FROM engine_types WHERE id LIKE 'ENG_0000%';
DELETE FROM models WHERE id LIKE 'MODEL_0000%';
DELETE FROM makes WHERE id LIKE 'MAKE_0000%';
DELETE FROM license_types WHERE id LIKE 'LIC_0000%';
-- Delete departments before locations to respect foreign key constraints
DELETE FROM departments WHERE name IN ('Test Operations', 'Test Maintenance');
DELETE FROM locations WHERE id LIKE 'LOC_0000%';

-- Test 2: Insert test data with unique names (parents first)
-- Insert locations before departments since departments reference locations
INSERT INTO locations (id, name, address, city, postal_code, country) VALUES 
('LOC_000001', 'Test Main Depot', '123 Fleet Street', 'Ponta Delgada', '9500-123', 'Portugal'),
('LOC_000002', 'Test North Station', '456 North Ave', 'Ribeira Grande', '9600-456', 'Portugal');

INSERT INTO departments (id, name, description, location_id) VALUES 
('DEPT_000001', 'Test Operations', 'Test operations department', 'LOC_000001'),
('DEPT_000002', 'Test Maintenance', 'Test vehicle maintenance department', 'LOC_000002');


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
('EMP_000001', 'Test João Silva', 'test.joao@mobiazores.pt', '+351 912 345 678', 'DEPT_000001'),
('EMP_000002', 'Test Maria Santos', 'test.maria@mobiazores.pt', '+351 913 456 789', 'DEPT_000002');

INSERT INTO drivers (id, employee_id, license_number, license_type_id, license_expiry_date, status) VALUES 
('DRV_000001', 'EMP_000001', 'TEST123456789', 'LIC_000001', '2025-12-31', 'active'),
('DRV_000002', 'EMP_000002', 'TEST987654321', 'LIC_000002', '2026-06-30', 'active');

INSERT INTO vehicles (id, license_plate, make_id, model_id, year, engine_type_id, fuel_capacity, current_odometer, status, location_id) VALUES 
('VEH_000001', 'TEST-12-34', 'MAKE_000001', 'MODEL_000001', 2023, 'ENG_000001', 50.0, 15000, 'active', 'LOC_000001'),
('VEH_000002', 'TEST-56-78', 'MAKE_000002', 'MODEL_000002', 2022, 'ENG_000002', 80.0, 25000, 'active', 'LOC_000002');

INSERT INTO fuel_stations (id, name, address, city, postal_code, country, fuel_types) VALUES 
('FS_000001', 'Test Galp Station', 'Av. Test Marginal', 'Ponta Delgada', '9500-789', 'Portugal', ARRAY['gasoline', 'diesel']),
('FS_000002', 'Test BP Station', 'Rua Test Principal', 'Ribeira Grande', '9600-123', 'Portugal', ARRAY['diesel', 'hybrid']);

INSERT INTO assignments (id, vehicle_id, driver_id, start_date, assignment_type, status) VALUES 
('ASG_000001', 'VEH_000001', 'DRV_000001', CURRENT_DATE, 'permanent', 'active'),
('ASG_000002', 'VEH_000002', 'DRV_000002', CURRENT_DATE, 'temporary', 'active');

INSERT INTO fuel_price_per_month (id, fuel_type, price_per_liter, month, year) VALUES 
('FPM_000001', 'gasoline', 1.45, 12, 2024),
('FPM_000002', 'diesel', 1.35, 12, 2024),
('FPM_000003', 'hybrid', 1.40, 12, 2024);

-- Test 3: Insert refuel records (triggers should calculate efficiency automatically)
INSERT INTO refuel_records (id, vehicle_id, driver_id, fuel_station_id, fuel_type, liters_filled, cost_per_liter, total_cost, odometer_reading, refuel_date, receipt_number) VALUES 
('REF_000001', 'VEH_000001', 'DRV_000001', 'FS_000001', 'gasoline', 45.0, 1.45, 65.25, 15500, CURRENT_DATE, 'TESTREC001'),
('REF_000002', 'VEH_000002', 'DRV_000002', 'FS_000002', 'diesel', 60.0, 1.35, 81.00, 25800, CURRENT_DATE, 'TESTREC002');
