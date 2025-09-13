-- MobiAzores Fleet Management - Data Migration Step 3: Cleanup
-- Run this AFTER verifying the migration was successful

-- Drop backup tables (only run after verifying migration success)
-- UNCOMMENT THESE LINES ONLY AFTER CONFIRMING DATA MIGRATION IS SUCCESSFUL

-- DROP TABLE IF EXISTS backup_departments;
-- DROP TABLE IF EXISTS backup_locations;
-- DROP TABLE IF EXISTS backup_fuel_stations;
-- DROP TABLE IF EXISTS backup_drivers;
-- DROP TABLE IF EXISTS backup_vehicles;
-- DROP TABLE IF EXISTS backup_refuel_records;
-- DROP TABLE IF EXISTS backup_maintenance_records;
-- DROP TABLE IF EXISTS backup_vehicle_assignments;

-- Update sequences to prevent ID conflicts
SELECT setval('departments_id_seq', (SELECT MAX(id::int) FROM departments) + 1, false);
SELECT setval('locations_id_seq', (SELECT MAX(id::int) FROM locations) + 1, false);
SELECT setval('drivers_id_seq', (SELECT MAX(id::int) FROM drivers) + 1, false);
SELECT setval('vehicles_id_seq', (SELECT MAX(id::int) FROM vehicles) + 1, false);
SELECT setval('refuel_records_id_seq', (SELECT MAX(id::int) FROM refuel_records) + 1, false);
SELECT setval('maintenance_records_id_seq', (SELECT MAX(id::int) FROM maintenance_records) + 1, false);
SELECT setval('vehicle_assignments_id_seq', (SELECT MAX(id::int) FROM vehicle_assignments) + 1, false);

-- Refresh all materialized views if any exist
-- REFRESH MATERIALIZED VIEW IF EXISTS fleet_performance_summary;

-- Analyze tables for better query performance
ANALYZE departments;
ANALYZE locations;
ANALYZE drivers;
ANALYZE vehicles;
ANALYZE fuel_prices;
ANALYZE refuel_records;
ANALYZE maintenance_records;
ANALYZE vehicle_assignments;

-- Final verification query
SELECT 
    'Migration completed successfully' as status,
    NOW() as completed_at,
    (SELECT COUNT(*) FROM departments) as departments_count,
    (SELECT COUNT(*) FROM locations) as locations_count,
    (SELECT COUNT(*) FROM drivers) as drivers_count,
    (SELECT COUNT(*) FROM vehicles) as vehicles_count,
    (SELECT COUNT(*) FROM refuel_records) as refuel_records_count,
    (SELECT COUNT(*) FROM maintenance_records) as maintenance_records_count,
    (SELECT COUNT(*) FROM vehicle_assignments) as assignments_count;
