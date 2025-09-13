-- MobiAzores Fleet Management - Streamlined Schema
-- Drop all existing tables and create new optimized structure

-- Drop all existing tables (order matters due to foreign keys)
DROP TABLE IF EXISTS refuel_records CASCADE;
DROP TABLE IF EXISTS maintenance_interventions CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS vehicle_assignments CASCADE;
DROP TABLE IF EXISTS insurance_claims CASCADE;
DROP TABLE IF EXISTS insurance_policies CASCADE;
DROP TABLE IF EXISTS vehicle_consumables CASCADE;
DROP TABLE IF EXISTS consumable_types CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;
DROP TABLE IF EXISTS assignment_types CASCADE;
DROP TABLE IF EXISTS vehicle_categories CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS fleet_performance_summary CASCADE;
DROP TABLE IF EXISTS department_fuel_analytics CASCADE;
DROP TABLE IF EXISTS monthly_fuel_analytics_by_vehicle CASCADE;
DROP TABLE IF EXISTS fuel_stations CASCADE;
DROP TABLE IF EXISTS route_points CASCADE;
DROP TABLE IF EXISTS fuel_prices CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create streamlined schema with essential tables only

-- 1. DEPARTMENTS (simplified)
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE, -- Short code for reporting
    budget_limit DECIMAL(12,2),
    manager_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LOCATIONS (consolidated fuel_stations and locations)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE, -- Internal reference
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_type VARCHAR(20) DEFAULT 'fuel_station' CHECK (location_type IN ('fuel_station', 'depot', 'maintenance', 'other')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DRIVERS (simplified, no separate users table)
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(20) UNIQUE NOT NULL, -- From CSV
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    license_number VARCHAR(50),
    license_expiry DATE,
    department_id UUID REFERENCES departments(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VEHICLES (consolidated with categories)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_number VARCHAR(20) UNIQUE NOT NULL, -- From CSV
    name VARCHAR(100),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    fuel_type VARCHAR(20) DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'gasoline', 'electric', 'hybrid')),
    tank_capacity DECIMAL(6,2),
    department_id UUID REFERENCES departments(id),
    home_location_id UUID REFERENCES locations(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired')),
    odometer_reading INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FUEL_PRICES (monthly evolution)
CREATE TABLE fuel_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fuel_type VARCHAR(20) NOT NULL,
    price_per_liter DECIMAL(6,3) NOT NULL,
    effective_date DATE NOT NULL, -- Month start date
    region VARCHAR(50) DEFAULT 'Azores',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (fuel_type, effective_date, region)
);

-- 6. REFUEL_RECORDS (main transaction table)
CREATE TABLE refuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    location_id UUID REFERENCES locations(id),
    refuel_date DATE NOT NULL,
    refuel_time TIME,
    liters DECIMAL(8,3) NOT NULL CHECK (liters > 0),
    cost_per_liter DECIMAL(6,3),
    total_cost DECIMAL(10,2),
    odometer_reading INTEGER NOT NULL CHECK (odometer_reading >= 0),
    distance_since_last INTEGER, -- Auto-calculated
    fuel_efficiency DECIMAL(6,2), -- L/100km, auto-calculated
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MAINTENANCE_RECORDS (simplified maintenance tracking)
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    maintenance_type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective', 'inspection'
    description TEXT NOT NULL,
    scheduled_date DATE,
    completed_date DATE,
    odometer_reading INTEGER,
    cost DECIMAL(10,2),
    technician_name VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. VEHICLE_ASSIGNMENTS (driver-vehicle relationships)
CREATE TABLE vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    unassigned_date DATE,
    assignment_type VARCHAR(30) DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'secondary', 'temporary')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_refuel_records_vehicle_date ON refuel_records(vehicle_id, refuel_date);
CREATE INDEX idx_refuel_records_driver ON refuel_records(driver_id);
CREATE INDEX idx_refuel_records_location ON refuel_records(location_id);
CREATE INDEX idx_vehicles_department ON vehicles(department_id);
CREATE INDEX idx_drivers_department ON drivers(department_id);
CREATE INDEX idx_maintenance_records_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_vehicle_assignments_active ON vehicle_assignments(vehicle_id, is_active);

-- Create triggers for automatic calculations
CREATE OR REPLACE FUNCTION calculate_refuel_metrics()
RETURNS TRIGGER AS $$
DECLARE
    last_refuel RECORD;
    distance INTEGER;
    efficiency DECIMAL(6,2);
BEGIN
    -- Get the previous refuel record for this vehicle
    SELECT odometer_reading, refuel_date 
    INTO last_refuel
    FROM refuel_records 
    WHERE vehicle_id = NEW.vehicle_id 
      AND refuel_date < NEW.refuel_date
      AND odometer_reading < NEW.odometer_reading
    ORDER BY refuel_date DESC, created_at DESC 
    LIMIT 1;

    -- Calculate distance since last refuel
    IF last_refuel.odometer_reading IS NOT NULL THEN
        distance := NEW.odometer_reading - last_refuel.odometer_reading;
        NEW.distance_since_last := distance;
        
        -- Calculate fuel efficiency (L/100km)
        IF distance > 0 THEN
            efficiency := (NEW.liters * 100.0) / distance;
            NEW.fuel_efficiency := efficiency;
        END IF;
    END IF;

    -- Auto-fill cost_per_liter from fuel_prices if not provided
    IF NEW.cost_per_liter IS NULL THEN
        SELECT price_per_liter INTO NEW.cost_per_liter
        FROM fuel_prices fp
        JOIN vehicles v ON v.id = NEW.vehicle_id
        WHERE fp.fuel_type = v.fuel_type
          AND fp.effective_date <= NEW.refuel_date
        ORDER BY fp.effective_date DESC
        LIMIT 1;
    END IF;

    -- Calculate total cost
    IF NEW.cost_per_liter IS NOT NULL THEN
        NEW.total_cost := NEW.liters * NEW.cost_per_liter;
    END IF;

    -- Update vehicle odometer
    UPDATE vehicles 
    SET odometer_reading = NEW.odometer_reading,
        updated_at = NOW()
    WHERE id = NEW.vehicle_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_refuel_metrics
    BEFORE INSERT OR UPDATE ON refuel_records
    FOR EACH ROW
    EXECUTE FUNCTION calculate_refuel_metrics();

-- Insert default fuel prices for Azores
INSERT INTO fuel_prices (fuel_type, price_per_liter, effective_date, region) VALUES
('diesel', 1.45, '2024-01-01', 'Azores'),
('gasoline', 1.55, '2024-01-01', 'Azores'),
('diesel', 1.48, '2024-02-01', 'Azores'),
('gasoline', 1.58, '2024-02-01', 'Azores'),
('diesel', 1.52, '2024-03-01', 'Azores'),
('gasoline', 1.62, '2024-03-01', 'Azores');

-- Insert sample departments
INSERT INTO departments (name, code, manager_name) VALUES
('Minibus Angra', 'MBA', 'João Silva'),
('Transporte Urbano', 'TU', 'Maria Santos'),
('Manutenção', 'MAN', 'Carlos Pereira');

-- Insert sample locations
INSERT INTO locations (name, code, location_type, address) VALUES
('Posto Angra Centro', 'PAC', 'fuel_station', 'Rua Principal, Angra do Heroísmo'),
('Depot Central', 'DC', 'depot', 'Zona Industrial, Angra do Heroísmo'),
('Oficina Principal', 'OP', 'maintenance', 'Rua da Manutenção, Angra do Heroísmo');

COMMENT ON TABLE departments IS 'Organizational departments managing vehicle fleets';
COMMENT ON TABLE locations IS 'Physical locations including fuel stations, depots, and maintenance facilities';
COMMENT ON TABLE drivers IS 'Fleet drivers with license and contact information';
COMMENT ON TABLE vehicles IS 'Fleet vehicles with specifications and current status';
COMMENT ON TABLE fuel_prices IS 'Historical fuel prices by type and region';
COMMENT ON TABLE refuel_records IS 'Individual refueling transactions with efficiency calculations';
COMMENT ON TABLE maintenance_records IS 'Vehicle maintenance history and scheduling';
COMMENT ON TABLE vehicle_assignments IS 'Driver-vehicle assignment relationships';
