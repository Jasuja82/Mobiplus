-- Create missing tables for the fleet management system
-- This script creates: assignment_types, departments, maintenance_schedules, and refuel_analytics

-- Create assignment_types table (referenced by assignments.type)
CREATE TABLE IF NOT EXISTS assignment_types (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- hex color code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table (referenced by vehicles.department_id)
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE,
    description TEXT,
    manager_id VARCHAR, -- references profiles.id (auth users)
    location_id VARCHAR REFERENCES locations(id),
    budget_limit NUMERIC(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    vehicle_id VARCHAR NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR NOT NULL, -- 'preventive', 'corrective', 'inspection'
    title VARCHAR NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_mileage INTEGER,
    priority VARCHAR DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    estimated_cost NUMERIC(10,2),
    estimated_duration_hours INTEGER,
    assigned_to VARCHAR, -- mechanic or service provider
    status VARCHAR DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'
    completed_date DATE,
    actual_cost NUMERIC(10,2),
    actual_duration_hours INTEGER,
    notes TEXT,
    next_service_date DATE,
    next_service_mileage INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create refuel_analytics view (separate from refuel_records for analytics)
CREATE OR REPLACE VIEW refuel_analytics AS
SELECT 
    r.id,
    r.vehicle_id,
    v.license_plate,
    v.vehicle_number,
    v.internal_number,
    r.driver_id,
    d.full_name as driver_name,
    d.code as driver_code,
    r.fuel_station_id,
    fs.name as fuel_station_name,
    fs.brand as fuel_station_brand,
    l.name as location_name,
    r.refuel_date as data,
    r.liters,
    r.cost_per_liter as literCost,
    r.total_cost as calculatedTotalLiterCost,
    r.odometer_reading as odometer,
    r.odometer_difference as calculatedOdometerDifference,
    r.notes,
    r.created_at as created,
    r.updated_at as updated,
    -- Additional analytics fields
    ROUND(r.total_cost / r.liters, 3) as cost_per_liter_calculated,
    CASE 
        WHEN r.odometer_difference > 0 THEN ROUND((r.liters * 100.0) / r.odometer_difference, 2)
        ELSE NULL 
    END as fuel_efficiency_l_per_100km,
    CASE 
        WHEN r.odometer_difference > 0 THEN ROUND(r.odometer_difference / r.liters, 2)
        ELSE NULL 
    END as km_per_liter,
    -- Validation flags
    CASE WHEN r.odometer_difference < 0 THEN true ELSE false END as has_negative_mileage,
    CASE WHEN r.odometer_difference > 1500 THEN true ELSE false END as has_high_mileage_jump,
    CASE WHEN r.liters > 200 THEN true ELSE false END as has_high_fuel_volume,
    CASE WHEN r.cost_per_liter < 0.5 OR r.cost_per_liter > 3.0 THEN true ELSE false END as has_unusual_fuel_price
FROM refuel_records r
LEFT JOIN vehicles v ON r.vehicle_id = v.id
LEFT JOIN drivers d ON r.driver_id = d.id
LEFT JOIN fuel_stations fs ON r.fuel_station_id = fs.id
LEFT JOIN locations l ON fs.location_id = l.id
ORDER BY r.refuel_date DESC, r.odometer_reading DESC;

-- Insert default assignment types
INSERT INTO assignment_types (name, description, color) VALUES
('Regular Service', 'Regular passenger or cargo transport service', '#3B82F6'),
('Emergency', 'Emergency response and medical transport', '#EF4444'),
('Maintenance', 'Vehicle maintenance and repair assignments', '#F59E0B'),
('Administrative', 'Administrative and office duties', '#6B7280'),
('Special Event', 'Special events and ceremonial duties', '#8B5CF6'),
('Training', 'Driver training and vehicle testing', '#10B981')
ON CONFLICT (name) DO NOTHING;

-- Insert default departments (based on typical Portuguese public administration)
INSERT INTO departments (name, code, description) VALUES
('Transportes Públicos', 'TP', 'Public transportation services'),
('Serviços Municipais', 'SM', 'Municipal services and utilities'),
('Proteção Civil', 'PC', 'Civil protection and emergency services'),
('Ambiente e Limpeza', 'AL', 'Environmental and cleaning services'),
('Obras Públicas', 'OP', 'Public works and infrastructure'),
('Administração', 'ADM', 'Administrative services'),
('Manutenção', 'MAN', 'Vehicle maintenance department')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_vehicle_id ON maintenance_schedules(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_assignment_types_active ON assignment_types(is_active);

-- Add foreign key constraints
ALTER TABLE assignments 
ADD CONSTRAINT fk_assignments_type 
FOREIGN KEY (type) REFERENCES assignment_types(name) 
ON UPDATE CASCADE;

-- Update existing assignments to use valid types
UPDATE assignments 
SET type = 'Regular Service' 
WHERE type IS NULL OR type NOT IN (SELECT name FROM assignment_types);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assignment_types_updated_at BEFORE UPDATE ON assignment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_schedules_updated_at BEFORE UPDATE ON maintenance_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) for all new tables
ALTER TABLE assignment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users for now)
CREATE POLICY "Allow all operations for authenticated users" ON assignment_types FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON departments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON maintenance_schedules FOR ALL TO authenticated USING (true);
