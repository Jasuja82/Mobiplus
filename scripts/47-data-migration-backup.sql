-- MobiAzores Fleet Management - Data Migration Step 1: Backup Existing Data
-- Create temporary backup tables before schema migration

-- Create backup tables for existing data
CREATE TABLE backup_departments AS SELECT * FROM departments WHERE 1=1;
CREATE TABLE backup_locations AS SELECT * FROM locations WHERE 1=1;
CREATE TABLE backup_fuel_stations AS SELECT * FROM fuel_stations WHERE 1=1;
CREATE TABLE backup_drivers AS SELECT * FROM drivers WHERE 1=1;
CREATE TABLE backup_vehicles AS SELECT * FROM vehicles WHERE 1=1;
CREATE TABLE backup_refuel_records AS SELECT * FROM refuel_records WHERE 1=1;
CREATE TABLE backup_maintenance_records AS SELECT * FROM maintenance_interventions WHERE 1=1;
CREATE TABLE backup_vehicle_assignments AS SELECT * FROM vehicle_assignments WHERE 1=1;

-- Log backup completion
INSERT INTO audit_log (table_name, action, details, created_at) VALUES
('migration', 'backup_created', 'All existing data backed up before schema migration', NOW());

-- Verify backup counts
SELECT 
    'departments' as table_name, COUNT(*) as record_count FROM backup_departments
UNION ALL
SELECT 'locations', COUNT(*) FROM backup_locations
UNION ALL
SELECT 'fuel_stations', COUNT(*) FROM backup_fuel_stations
UNION ALL
SELECT 'drivers', COUNT(*) FROM backup_drivers
UNION ALL
SELECT 'vehicles', COUNT(*) FROM backup_vehicles
UNION ALL
SELECT 'refuel_records', COUNT(*) FROM backup_refuel_records
UNION ALL
SELECT 'maintenance_records', COUNT(*) FROM backup_maintenance_records
UNION ALL
SELECT 'vehicle_assignments', COUNT(*) FROM backup_vehicle_assignments;
