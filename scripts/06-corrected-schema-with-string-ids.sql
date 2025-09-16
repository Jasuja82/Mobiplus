-- Drop all existing tables and views in correct dependency order
-- This script completely recreates the database with string-based IDs

-- Drop views first
DROP VIEW IF EXISTS department_fuel_analytics CASCADE;
DROP VIEW IF EXISTS fleet_performance_summary CASCADE;
DROP VIEW IF EXISTS monthly_fuel_analytics_by_vehicle CASCADE;
DROP VIEW IF EXISTS vehicles_with_age CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS trip_records CASCADE;
DROP TABLE IF EXISTS refuel_records CASCADE;
DROP TABLE IF EXISTS vehicle_assignments CASCADE;
DROP TABLE IF EXISTS maintenance_interventions CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS insurance_claims CASCADE;
DROP TABLE IF EXISTS insurance_policies CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS fuel_stations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS vehicle_categories CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;
DROP TABLE IF EXISTS assignment_types CASCADE;
DROP TABLE IF EXISTS monthly_fuel_prices CASCADE;
DROP TABLE IF EXISTS route_assignments CASCADE;
DROP TABLE IF EXISTS fuel_analysis CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS fuel_type CASCADE;
DROP TYPE IF EXISTS vehicle_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS maintenance_status CASCADE;

-- Create custom types
CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid');
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'retired', 'sold');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'driver', 'mechanic');
CREATE TYPE maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create lookup/reference tables first
CREATE TABLE makes (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE models (
    id VARCHAR(20) PRIMARY KEY,
    make_id VARCHAR(20) NOT NULL REFERENCES makes(id),
    name VARCHAR(100) NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(make_id, name)
);

CREATE TABLE engine_types (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    fuel_type fuel_type NOT NULL,
    displacement_cc INTEGER,
    power_hp INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE license_types (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    vehicle_categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE departments (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    budget DECIMAL(12,2),
    manager_id VARCHAR(20),
    location_id VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE locations (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Portugal',
    coordinates POINT,
    internal_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for departments after locations table exists
ALTER TABLE departments ADD CONSTRAINT fk_departments_location 
    FOREIGN KEY (location_id) REFERENCES locations(id);

CREATE TABLE employees (
    id VARCHAR(20) PRIMARY KEY,
    employee_number VARCHAR(50) UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    department_id VARCHAR(20) REFERENCES departments(id),
    role user_role DEFAULT 'driver',
    license_type_id VARCHAR(20) REFERENCES license_types(id),
    license_number VARCHAR(100),
    license_expiry DATE,
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add manager foreign key constraint after employees table exists
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager 
    FOREIGN KEY (manager_id) REFERENCES employees(id);

CREATE TABLE drivers (
    id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL REFERENCES employees(id),
    code VARCHAR(50) UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100),
    license_expiry DATE,
    medical_certificate_expiry DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vehicle_details (
    id VARCHAR(20) PRIMARY KEY,
    make_id VARCHAR(20) NOT NULL REFERENCES makes(id),
    model_id VARCHAR(20) NOT NULL REFERENCES models(id),
    engine_type_id VARCHAR(20) REFERENCES engine_types(id),
    year INTEGER NOT NULL,
    color VARCHAR(50),
    doors INTEGER,
    seats INTEGER,
    transmission VARCHAR(50),
    fuel_capacity DECIMAL(8,2),
    weight_kg INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vehicles (
    id VARCHAR(20) PRIMARY KEY,
    vehicle_details_id VARCHAR(20) NOT NULL REFERENCES vehicle_details(id),
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vin VARCHAR(50) UNIQUE,
    vehicle_number VARCHAR(50),
    internal_number VARCHAR(50),
    department_id VARCHAR(20) REFERENCES departments(id),
    home_location_id VARCHAR(20) REFERENCES locations(id),
    current_location_id VARCHAR(20) REFERENCES locations(id),
    status vehicle_status DEFAULT 'active',
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    registration_date DATE,
    current_mileage INTEGER DEFAULT 0,
    insurance_policy VARCHAR(100),
    insurance_expiry DATE,
    inspection_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fuel_stations (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    address TEXT,
    location_id VARCHAR(20) REFERENCES locations(id),
    coordinates POINT,
    fuel_types fuel_type[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE assignments (
    id VARCHAR(20) PRIMARY KEY,
    vehicle_id VARCHAR(20) NOT NULL REFERENCES vehicles(id),
    driver_id VARCHAR(20) NOT NULL REFERENCES drivers(id),
    assigned_by VARCHAR(20) REFERENCES employees(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unassigned_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fuel_price_per_month (
    id VARCHAR(20) PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    fuel_type fuel_type NOT NULL,
    price_per_liter DECIMAL(6,3) NOT NULL,
    region VARCHAR(100) DEFAULT 'Azores',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, month, fuel_type, region)
);

CREATE TABLE refuel_records (
    id VARCHAR(20) PRIMARY KEY,
    vehicle_id VARCHAR(20) NOT NULL REFERENCES vehicles(id),
    driver_id VARCHAR(20) REFERENCES drivers(id),
    fuel_station_id VARCHAR(20) REFERENCES fuel_stations(id),
    location_id VARCHAR(20) REFERENCES locations(id),
    refuel_date TIMESTAMP WITH TIME ZONE NOT NULL,
    odometer_reading INTEGER NOT NULL,
    liters DECIMAL(8,2) NOT NULL,
    cost_per_liter DECIMAL(6,3) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    is_full_tank BOOLEAN DEFAULT true,
    receipt_number VARCHAR(100),
    invoice_number VARCHAR(100),
    fuel_station VARCHAR(200), -- For legacy compatibility
    notes TEXT,
    created_by VARCHAR(20) REFERENCES employees(id),
    
    -- Calculated fields (populated by triggers)
    odometer_difference INTEGER,
    fuel_efficiency_l_per_100km DECIMAL(8,2),
    km_per_liter DECIMAL(8,2),
    cost_per_km DECIMAL(8,3),
    distance_since_last_refuel INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_refuel_records_vehicle_date ON refuel_records(vehicle_id, refuel_date);
CREATE INDEX idx_refuel_records_date ON refuel_records(refuel_date);
CREATE INDEX idx_vehicles_department ON vehicles(department_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_assignments_active ON assignments(is_active, vehicle_id, driver_id);

-- Create function to calculate refuel metrics
CREATE OR REPLACE FUNCTION calculate_refuel_metrics()
RETURNS TRIGGER AS $$
DECLARE
    prev_record RECORD;
BEGIN
    -- Get the previous refuel record for this vehicle
    SELECT odometer_reading, refuel_date
    INTO prev_record
    FROM refuel_records
    WHERE vehicle_id = NEW.vehicle_id 
      AND refuel_date < NEW.refuel_date
      AND id != NEW.id
    ORDER BY refuel_date DESC
    LIMIT 1;
    
    IF prev_record IS NOT NULL THEN
        -- Calculate odometer difference
        NEW.odometer_difference := NEW.odometer_reading - prev_record.odometer_reading;
        NEW.distance_since_last_refuel := NEW.odometer_difference;
        
        -- Calculate fuel efficiency (only if distance > 0)
        IF NEW.odometer_difference > 0 THEN
            NEW.fuel_efficiency_l_per_100km := (NEW.liters * 100.0) / NEW.odometer_difference;
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

-- Create views for analytics
CREATE VIEW vehicle_summary AS
SELECT 
    v.id,
    v.license_plate,
    vd.make_id,
    m.name as make,
    vd.model_id,
    mo.name as model,
    vd.year,
    v.department_id,
    d.name as department_name,
    v.status,
    v.current_mileage,
    v.home_location_id,
    l.name as home_location_name
FROM vehicles v
JOIN vehicle_details vd ON v.vehicle_details_id = vd.id
JOIN makes m ON vd.make_id = m.id
JOIN models mo ON vd.model_id = mo.id
LEFT JOIN departments d ON v.department_id = d.id
LEFT JOIN locations l ON v.home_location_id = l.id;

CREATE VIEW refuel_summary AS
SELECT 
    rr.*,
    vs.license_plate,
    vs.make,
    vs.model,
    vs.department_name,
    l.name as location_name,
    d.full_name as driver_name
FROM refuel_records rr
JOIN vehicle_summary vs ON rr.vehicle_id = vs.id
LEFT JOIN locations l ON rr.location_id = l.id
LEFT JOIN drivers d ON rr.driver_id = d.id;

-- Insert sample data
INSERT INTO makes (id, name, country) VALUES 
('MAK_000001', 'Toyota', 'Japan'),
('MAK_000002', 'Volkswagen', 'Germany'),
('MAK_000003', 'Ford', 'USA'),
('MAK_000004', 'Renault', 'France'),
('MAK_000005', 'Peugeot', 'France');

INSERT INTO models (id, make_id, name, year_start, year_end) VALUES 
('MOD_000001', 'MAK_000001', 'Corolla', 1966, NULL),
('MOD_000002', 'MAK_000001', 'Camry', 1982, NULL),
('MOD_000003', 'MAK_000002', 'Golf', 1974, NULL),
('MOD_000004', 'MAK_000003', 'Focus', 1998, NULL),
('MOD_000005', 'MAK_000004', 'Clio', 1990, NULL);

INSERT INTO engine_types (id, name, fuel_type, displacement_cc, power_hp) VALUES 
('ENG_000001', '1.6L Gasoline', 'gasoline', 1600, 120),
('ENG_000002', '2.0L Diesel', 'diesel', 2000, 150),
('ENG_000003', '1.4L Turbo', 'gasoline', 1400, 140),
('ENG_000004', 'Hybrid 1.8L', 'hybrid', 1800, 140);

INSERT INTO license_types (id, name, description, vehicle_categories) VALUES 
('LIC_000001', 'Category B', 'Standard car license', ARRAY['passenger', 'light_commercial']),
('LIC_000002', 'Category C', 'Heavy vehicle license', ARRAY['truck', 'heavy_commercial']),
('LIC_000003', 'Category D', 'Bus license', ARRAY['bus', 'passenger_transport']);

INSERT INTO locations (id, name, address, city, region, country) VALUES 
('LOC_000001', 'Headquarters', 'Rua Principal 123', 'Ponta Delgada', 'São Miguel', 'Portugal'),
('LOC_000002', 'Angra Branch', 'Av. Central 456', 'Angra do Heroísmo', 'Terceira', 'Portugal'),
('LOC_000003', 'Horta Office', 'Rua do Porto 789', 'Horta', 'Faial', 'Portugal');

INSERT INTO departments (id, name, description, budget, location_id) VALUES 
('DEP_000001', 'Administration', 'Administrative services', 50000.00, 'LOC_000001'),
('DEP_000002', 'Operations', 'Operational activities', 100000.00, 'LOC_000001'),
('DEP_000003', 'Maintenance', 'Vehicle maintenance', 75000.00, 'LOC_000002');

INSERT INTO fuel_price_per_month (id, year, month, fuel_type, price_per_liter, region) VALUES 
('FPM_000001', 2024, 1, 'gasoline', 1.45, 'Azores'),
('FPM_000002', 2024, 1, 'diesel', 1.35, 'Azores'),
('FPM_000003', 2024, 2, 'gasoline', 1.48, 'Azores'),
('FPM_000004', 2024, 2, 'diesel', 1.38, 'Azores');

-- Create sequence functions for generating IDs
CREATE OR REPLACE FUNCTION generate_vehicle_id() RETURNS VARCHAR(20) AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1
    INTO next_num
    FROM vehicles
    WHERE id LIKE 'VEH_%';
    
    RETURN 'VEH_' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_driver_id() RETURNS VARCHAR(20) AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1
    INTO next_num
    FROM drivers
    WHERE id LIKE 'DRV_%';
    
    RETURN 'DRV_' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_refuel_id() RETURNS VARCHAR(20) AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1
    INTO next_num
    FROM refuel_records
    WHERE id LIKE 'REF_%';
    
    RETURN 'REF_' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE refuel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - adjust based on your auth requirements)
CREATE POLICY "Users can view refuel records" ON refuel_records FOR SELECT USING (true);
CREATE POLICY "Users can insert refuel records" ON refuel_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update refuel records" ON refuel_records FOR UPDATE USING (true);

CREATE POLICY "Users can view vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Users can view drivers" ON drivers FOR SELECT USING (true);

COMMIT;
