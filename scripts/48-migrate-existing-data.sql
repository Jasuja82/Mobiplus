-- MobiAzores Fleet Management - Data Migration Step 2: Migrate Data to New Schema
-- Run this AFTER the new schema has been created (script 46)

-- Migrate departments (consolidate if needed)
INSERT INTO departments (id, name, code, manager_name, status, created_at, updated_at)
SELECT 
    id,
    name,
    UPPER(LEFT(name, 3)) as code, -- Generate code from name
    manager_name,
    CASE 
        WHEN status = 'active' THEN 'active'
        ELSE 'inactive'
    END as status,
    created_at,
    updated_at
FROM backup_departments
ON CONFLICT (id) DO NOTHING;

-- Migrate locations (consolidate fuel_stations and locations)
INSERT INTO locations (id, name, code, address, latitude, longitude, location_type, status, created_at, updated_at)
SELECT 
    id,
    name,
    internal_number as code,
    address,
    latitude,
    longitude,
    'depot' as location_type,
    CASE 
        WHEN status = 'active' THEN 'active'
        ELSE 'inactive'
    END as status,
    created_at,
    updated_at
FROM backup_locations
WHERE id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Migrate fuel stations as locations
INSERT INTO locations (id, name, code, address, latitude, longitude, location_type, status, created_at, updated_at)
SELECT 
    id,
    name,
    COALESCE(code, 'FS' || ROW_NUMBER() OVER()) as code,
    address,
    latitude,
    longitude,
    'fuel_station' as location_type,
    'active' as status,
    COALESCE(created_at, NOW()),
    COALESCE(updated_at, NOW())
FROM backup_fuel_stations
WHERE id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Migrate drivers (no users table dependency)
INSERT INTO drivers (id, employee_number, name, email, phone, license_number, license_expiry, department_id, status, created_at, updated_at)
SELECT 
    d.id,
    d.internal_number as employee_number,
    d.name,
    d.email,
    d.phone,
    d.license_number,
    d.license_expiry,
    d.department_id,
    CASE 
        WHEN d.status = 'active' THEN 'active'
        WHEN d.status = 'inactive' THEN 'inactive'
        ELSE 'suspended'
    END as status,
    d.created_at,
    d.updated_at
FROM backup_drivers d
WHERE d.id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Migrate vehicles
INSERT INTO vehicles (id, internal_number, name, license_plate, make, model, year, fuel_type, tank_capacity, department_id, home_location_id, status, odometer_reading, created_at, updated_at)
SELECT 
    v.id,
    v.internal_number,
    v.name,
    v.license_plate,
    v.make,
    v.model,
    v.year,
    COALESCE(v.fuel_type, 'diesel') as fuel_type,
    v.tank_capacity,
    v.department_id,
    v.location_id as home_location_id,
    CASE 
        WHEN v.status = 'active' THEN 'active'
        WHEN v.status = 'maintenance' THEN 'maintenance'
        WHEN v.status = 'inactive' THEN 'inactive'
        ELSE 'retired'
    END as status,
    COALESCE(v.odometer_reading, 0) as odometer_reading,
    v.created_at,
    v.updated_at
FROM backup_vehicles v
WHERE v.id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Migrate refuel records
INSERT INTO refuel_records (id, vehicle_id, driver_id, location_id, refuel_date, refuel_time, liters, cost_per_liter, total_cost, odometer_reading, distance_since_last, fuel_efficiency, notes, created_at, updated_at)
SELECT 
    r.id,
    r.vehicle_id,
    r.driver_id,
    r.fuel_station_id as location_id,
    r.refuel_date,
    r.refuel_time,
    r.liters,
    r.cost_per_liter,
    r.total_cost,
    r.odometer_reading,
    r.distance_since_last,
    r.fuel_efficiency,
    r.notes,
    r.created_at,
    r.updated_at
FROM backup_refuel_records r
WHERE r.id IS NOT NULL
  AND r.vehicle_id IS NOT NULL
  AND r.liters > 0
  AND r.odometer_reading >= 0
ON CONFLICT (id) DO NOTHING;

-- Migrate maintenance records
INSERT INTO maintenance_records (id, vehicle_id, maintenance_type, description, scheduled_date, completed_date, odometer_reading, cost, technician_name, notes, status, created_at, updated_at)
SELECT 
    m.id,
    m.vehicle_id,
    COALESCE(m.maintenance_type, 'corrective') as maintenance_type,
    COALESCE(m.description, 'Migrated maintenance record') as description,
    m.scheduled_date,
    m.completed_date,
    m.odometer_reading,
    m.cost,
    m.technician_name,
    m.notes,
    CASE 
        WHEN m.completed_date IS NOT NULL THEN 'completed'
        WHEN m.scheduled_date > CURRENT_DATE THEN 'scheduled'
        ELSE 'in_progress'
    END as status,
    m.created_at,
    m.updated_at
FROM backup_maintenance_records m
WHERE m.id IS NOT NULL
  AND m.vehicle_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Migrate vehicle assignments
INSERT INTO vehicle_assignments (id, vehicle_id, driver_id, assigned_date, unassigned_date, assignment_type, is_active, created_at, updated_at)
SELECT 
    va.id,
    va.vehicle_id,
    va.driver_id,
    COALESCE(va.assigned_date, CURRENT_DATE) as assigned_date,
    va.unassigned_date,
    COALESCE(va.assignment_type, 'primary') as assignment_type,
    CASE 
        WHEN va.unassigned_date IS NULL THEN true
        ELSE false
    END as is_active,
    va.created_at,
    va.updated_at
FROM backup_vehicle_assignments va
WHERE va.id IS NOT NULL
  AND va.vehicle_id IS NOT NULL
  AND va.driver_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Verify migration counts
SELECT 
    'departments' as table_name, 
    (SELECT COUNT(*) FROM backup_departments) as original_count,
    (SELECT COUNT(*) FROM departments) as migrated_count
UNION ALL
SELECT 'locations', 
    (SELECT COUNT(*) FROM backup_locations) + (SELECT COUNT(*) FROM backup_fuel_stations),
    (SELECT COUNT(*) FROM locations)
UNION ALL
SELECT 'drivers', 
    (SELECT COUNT(*) FROM backup_drivers),
    (SELECT COUNT(*) FROM drivers)
UNION ALL
SELECT 'vehicles', 
    (SELECT COUNT(*) FROM backup_vehicles),
    (SELECT COUNT(*) FROM vehicles)
UNION ALL
SELECT 'refuel_records', 
    (SELECT COUNT(*) FROM backup_refuel_records),
    (SELECT COUNT(*) FROM refuel_records)
UNION ALL
SELECT 'maintenance_records', 
    (SELECT COUNT(*) FROM backup_maintenance_records),
    (SELECT COUNT(*) FROM maintenance_records)
UNION ALL
SELECT 'vehicle_assignments', 
    (SELECT COUNT(*) FROM backup_vehicle_assignments),
    (SELECT COUNT(*) FROM vehicle_assignments);
