-- Drop all existing tables and recreate with string IDs
-- This will completely reset the database with a fresh structure

-- Drop all existing tables (in dependency order)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS department_fuel_analytics CASCADE;
DROP TABLE IF EXISTS fleet_performance_summary CASCADE;
DROP TABLE IF EXISTS monthly_fuel_analytics_by_vehicle CASCADE;
DROP TABLE IF EXISTS vehicles_with_age CASCADE;
DROP TABLE IF EXISTS insurance_claims CASCADE;
DROP TABLE IF EXISTS insurance_policies CASCADE;
DROP TABLE IF EXISTS maintenance_interventions CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS vehicle_assignments CASCADE;
DROP TABLE IF EXISTS refuel_records CASCADE;
DROP TABLE IF EXISTS trip_records CASCADE;
DROP TABLE IF EXISTS fuel_analysis CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS fuel_stations CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS route_assignments CASCADE;
DROP TABLE IF EXISTS monthly_fuel_prices CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;
DROP TABLE IF EXISTS vehicle_categories CASCADE;
DROP TABLE IF EXISTS assignment_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS fuel_type CASCADE;
DROP TYPE IF EXISTS vehicle_status CASCADE;
DROP TYPE IF EXISTS maintenance_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create custom types
CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid');
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'retired', 'reserved');
CREATE TYPE maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'driver', 'mechanic', 'viewer');

-- Create lookup/reference tables first
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'DEPT_' || LPAD(nextval('departments_seq')::text, 6, '0'),
    name TEXT NOT NULL,
    description TEXT,
    budget DECIMAL(12,2),
    manager_id VARCHAR(50),
    location_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE departments_seq START 1;

CREATE TABLE locations (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'LOC_' || LPAD(nextval('locations_seq')::text, 6, '0'),
    internal_number VARCHAR(20) UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT DEFAULT 'Portugal',
    coordinates POINT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE locations_seq START 1;

CREATE TABLE license_types (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'LIC_' || LPAD(nextval('license_types_seq')::text, 6, '0'),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE license_types_seq START 1;

CREATE TABLE makes (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'MAKE_' || LPAD(nextval('makes_seq')::text, 6, '0'),
    name TEXT NOT NULL UNIQUE,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE makes_seq START 1;

CREATE TABLE models (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'MODEL_' || LPAD(nextval('models_seq')::text, 6, '0'),
    name TEXT NOT NULL,
    make_id VARCHAR(50) REFERENCES makes(id),
    year_from INTEGER,
    year_to INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE models_seq START 1;

CREATE TABLE engine_types (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'ENG_' || LPAD(nextval('engine_types_seq')::text, 6, '0'),
    name TEXT NOT NULL,
    fuel_type fuel_type NOT NULL,
    displacement DECIMAL(4,1),
    power_hp INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE engine_types_seq START 1;

CREATE TABLE vehicle_details (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'VD_' || LPAD(nextval('vehicle_details_seq')::text, 6, '0'),
    transmission TEXT,
    doors INTEGER,
    seats INTEGER,
    color TEXT,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE vehicle_details_seq START 1;

-- Create main entity tables
CREATE TABLE drivers (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'DRV_' || LPAD(nextval('drivers_seq')::text, 6, '0'),
    internal_number VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dob DATE,
    license_type_id VARCHAR(50) REFERENCES license_types(id),
    status TEXT DEFAULT 'active',
    phone TEXT,
    email TEXT,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE drivers_seq START 1;

CREATE TABLE assignments (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'ASG_' || LPAD(nextval('assignments_seq')::text, 6, '0'),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE assignments_seq START 1;

CREATE TABLE vehicles (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'VEH_' || LPAD(nextval('vehicles_seq')::text, 6, '0'),
    internal_number VARCHAR(20) UNIQUE NOT NULL,
    license_plate TEXT UNIQUE NOT NULL,
    make_id VARCHAR(50) REFERENCES makes(id),
    model_id VARCHAR(50) REFERENCES models(id),
    vehicle_details_id VARCHAR(50) REFERENCES vehicle_details(id),
    engine_type_id VARCHAR(50) REFERENCES engine_types(id),
    assignment_id VARCHAR(50) REFERENCES assignments(id),
    status vehicle_status DEFAULT 'active',
    notes TEXT,
    year INTEGER,
    vin TEXT UNIQUE,
    fuel_capacity DECIMAL(6,2),
    current_mileage INTEGER DEFAULT 0,
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    insurance_expiry DATE,
    inspection_expiry DATE,
    department_id VARCHAR(50) REFERENCES departments(id),
    home_location_id VARCHAR(50) REFERENCES locations(id),
    current_location_id VARCHAR(50) REFERENCES locations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE vehicles_seq START 1;

CREATE TABLE fuel_stations (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'FS_' || LPAD(nextval('fuel_stations_seq')::text, 6, '0'),
    internal_number VARCHAR(20) UNIQUE NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    notes TEXT,
    brand TEXT,
    address TEXT,
    coordinates POINT,
    location_id VARCHAR(50) REFERENCES locations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE fuel_stations_seq START 1;

CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'EMP_' || LPAD(nextval('employees_seq')::text, 6, '0'),
    name TEXT NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id),
    type_id VARCHAR(50),
    hire_date DATE,
    dob DATE,
    employee_number VARCHAR(20) UNIQUE,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE employees_seq START 1;

CREATE TABLE fuel_price_per_month (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'FPM_' || LPAD(nextval('fuel_price_per_month_seq')::text, 6, '0'),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    fuel_type fuel_type NOT NULL,
    price_per_liter DECIMAL(6,3) NOT NULL,
    region TEXT DEFAULT 'Azores',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, month, fuel_type, region)
);

CREATE SEQUENCE fuel_price_per_month_seq START 1;

-- Create transaction tables
CREATE TABLE refuel_records (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'REF_' || LPAD(nextval('refuel_records_seq')::text, 6, '0'),
    vehicle_id VARCHAR(50) NOT NULL REFERENCES vehicles(id),
    driver_id VARCHAR(50) NOT NULL REFERENCES drivers(id),
    fuel_station_id VARCHAR(50) REFERENCES fuel_stations(id),
    refuel_date TIMESTAMP WITH TIME ZONE NOT NULL,
    odometer_reading INTEGER NOT NULL,
    liters DECIMAL(8,3) NOT NULL,
    cost_per_liter DECIMAL(6,3) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    odometer_difference INTEGER, -- Calculated field
    notes TEXT,
    receipt_number TEXT,
    invoice_number TEXT,
    is_full_tank BOOLEAN DEFAULT true,
    fuel_efficiency_l_per_100km DECIMAL(6,2), -- Calculated field
    cost_per_km DECIMAL(6,3), -- Calculated field
    km_per_liter DECIMAL(6,2), -- Calculated field
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE refuel_records_seq START 1;

-- Create indexes for better performance
CREATE INDEX idx_refuel_records_vehicle_id ON refuel_records(vehicle_id);
CREATE INDEX idx_refuel_records_driver_id ON refuel_records(driver_id);
CREATE INDEX idx_refuel_records_date ON refuel_records(refuel_date);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_internal_number ON vehicles(internal_number);
CREATE INDEX idx_drivers_internal_number ON drivers(internal_number);

-- Create function to calculate refuel record fields
CREATE OR REPLACE FUNCTION calculate_refuel_metrics()
RETURNS TRIGGER AS $$
DECLARE
    prev_record RECORD;
BEGIN
    -- Get the previous refuel record for the same vehicle
    SELECT odometer_reading, refuel_date 
    INTO prev_record
    FROM refuel_records 
    WHERE vehicle_id = NEW.vehicle_id 
      AND refuel_date < NEW.refuel_date 
    ORDER BY refuel_date DESC 
    LIMIT 1;
    
    -- Calculate odometer difference
    IF prev_record.odometer_reading IS NOT NULL THEN
        NEW.odometer_difference := NEW.odometer_reading - prev_record.odometer_reading;
        
        -- Calculate fuel efficiency (liters per 100km)
        IF NEW.odometer_difference > 0 THEN
            NEW.fuel_efficiency_l_per_100km := (NEW.liters / NEW.odometer_difference) * 100;
            NEW.km_per_liter := NEW.odometer_difference / NEW.liters;
            NEW.cost_per_km := NEW.total_cost / NEW.odometer_difference;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic calculation
CREATE TRIGGER trigger_calculate_refuel_metrics
    BEFORE INSERT OR UPDATE ON refuel_records
    FOR EACH ROW
    EXECUTE FUNCTION calculate_refuel_metrics();

-- Insert some basic reference data
INSERT INTO license_types (name, description, category) VALUES
('B', 'Light vehicles up to 3.5t', 'standard'),
('C', 'Heavy vehicles over 3.5t', 'commercial'),
('D', 'Passenger transport', 'commercial');

INSERT INTO makes (name, country) VALUES
('Toyota', 'Japan'),
('Volkswagen', 'Germany'),
('Ford', 'USA'),
('Renault', 'France'),
('Peugeot', 'France');

INSERT INTO models (name, make_id, year_from, year_to) VALUES
('Corolla', 'MAKE_000001', 1990, NULL),
('Golf', 'MAKE_000002', 1985, NULL),
('Focus', 'MAKE_000003', 1995, NULL),
('Clio', 'MAKE_000004', 1990, NULL),
('308', 'MAKE_000005', 2007, NULL);

INSERT INTO engine_types (name, fuel_type, displacement, power_hp) VALUES
('1.6L Gasoline', 'gasoline', 1.6, 120),
('2.0L Diesel', 'diesel', 2.0, 150),
('1.4L Hybrid', 'hybrid', 1.4, 100);

INSERT INTO departments (name, description) VALUES
('Transportation', 'Vehicle fleet management'),
('Maintenance', 'Vehicle maintenance and repair'),
('Administration', 'Administrative services');

INSERT INTO locations (name, address, city, region, country) VALUES
('Main Depot', 'Rua Principal 123', 'Ponta Delgada', 'São Miguel', 'Portugal'),
('Secondary Depot', 'Avenida Central 456', 'Angra do Heroísmo', 'Terceira', 'Portugal');

-- Create views for analytics
CREATE VIEW vehicle_summary AS
SELECT 
    v.id,
    v.internal_number,
    v.license_plate,
    m.name as make,
    mo.name as model,
    v.year,
    v.status,
    d.name as department,
    l.name as home_location,
    v.current_mileage,
    v.fuel_capacity
FROM vehicles v
LEFT JOIN makes m ON v.make_id = m.id
LEFT JOIN models mo ON v.model_id = mo.id
LEFT JOIN departments d ON v.department_id = d.id
LEFT JOIN locations l ON v.home_location_id = l.id;

CREATE VIEW refuel_summary AS
SELECT 
    r.id,
    r.refuel_date,
    v.license_plate,
    v.internal_number as vehicle_number,
    d.name as driver_name,
    r.liters,
    r.total_cost,
    r.odometer_reading,
    r.odometer_difference,
    r.fuel_efficiency_l_per_100km,
    r.cost_per_km,
    fs.location as fuel_station
FROM refuel_records r
JOIN vehicles v ON r.vehicle_id = v.id
JOIN drivers d ON r.driver_id = d.id
LEFT JOIN fuel_stations fs ON r.fuel_station_id = fs.id
ORDER BY r.refuel_date DESC;
