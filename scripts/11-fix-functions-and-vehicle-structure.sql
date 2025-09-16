-- Fix the generate_string_id function and create proper vehicle details structure
-- Drop existing problematic functions and recreate them properly

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS generate_string_id(text);
DROP FUNCTION IF EXISTS calculate_odometer_difference(varchar);

-- Create the string ID generation function with proper parameter types
CREATE OR REPLACE FUNCTION generate_string_id(prefix text)
RETURNS varchar(20) AS $$
DECLARE
    next_num integer;
    sequence_name text;
BEGIN
    -- Create sequence name based on prefix
    sequence_name := prefix || '_sequence';
    
    -- Create sequence if it doesn't exist
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START 1', sequence_name);
    
    -- Get next value from sequence
    EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_num;
    
    -- Return formatted ID
    RETURN prefix || '_' || LPAD(next_num::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create the odometer difference calculation function
CREATE OR REPLACE FUNCTION calculate_odometer_difference(vehicle_ref varchar)
RETURNS integer AS $$
DECLARE
    current_reading integer;
    previous_reading integer;
BEGIN
    -- Get the most recent odometer reading for this vehicle
    SELECT odometer_reading INTO current_reading
    FROM refuel_records 
    WHERE vehicle_id = vehicle_ref 
    ORDER BY refuel_date DESC 
    LIMIT 1;
    
    -- Get the second most recent reading
    SELECT odometer_reading INTO previous_reading
    FROM refuel_records 
    WHERE vehicle_id = vehicle_ref 
    ORDER BY refuel_date DESC 
    OFFSET 1 LIMIT 1;
    
    -- Return difference or 0 if no previous reading
    RETURN COALESCE(current_reading - previous_reading, 0);
END;
$$ LANGUAGE plpgsql;

-- Drop existing vehicle-related tables to recreate with proper structure
DROP TABLE IF EXISTS vehicle_tires CASCADE;
DROP TABLE IF EXISTS vehicle_engine_details CASCADE;
DROP TABLE IF EXISTS vehicle_oils_filters CASCADE;
DROP TABLE IF EXISTS vehicle_details CASCADE;

-- Create main vehicle details table based on CSV structure
CREATE TABLE vehicle_details (
    id varchar(20) PRIMARY KEY DEFAULT generate_string_id('VDT'),
    vehicle_id varchar(20) REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Registration and identification
    registration_date date, -- data_matricula
    chassis_number varchar(50), -- numero_chassis
    
    -- Physical specifications
    gross_weight_kg varchar(20), -- peso_bruto_t
    tare_weight_kg varchar(20), -- tara_t
    tire_size varchar(50), -- pneus_x1_x2
    
    -- Service information
    service_type varchar(50), -- servico
    typology varchar(50), -- tipologia
    emission_standard varchar(50), -- emissao
    
    -- Accessibility features (converted from date to boolean for proper use)
    wheelchair_accessible boolean DEFAULT false, -- cadeira_rodas
    standing_capacity boolean DEFAULT false, -- pe
    seated_capacity boolean DEFAULT false, -- sentado
    guide_assistance boolean DEFAULT false, -- guia
    
    -- Current status
    current_km integer DEFAULT 0, -- km_atual
    monthly_km integer DEFAULT 0, -- km_mes
    daily_average_km decimal(10,2) DEFAULT 0, -- media_diaria
    
    -- Capacity information
    total_capacity integer DEFAULT 0, -- total
    age_years integer, -- em_anos_completos
    age_months integer, -- em_meses
    
    -- Notes
    observations text, -- observacoes
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create vehicle engine details table
CREATE TABLE vehicle_engine_details (
    id varchar(20) PRIMARY KEY DEFAULT generate_string_id('VED'),
    vehicle_id varchar(20) REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Engine specifications (to be populated from CSV)
    engine_type varchar(100),
    displacement_cc integer,
    power_hp integer,
    power_kw integer,
    fuel_type varchar(50),
    transmission_type varchar(50),
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create vehicle tires table
CREATE TABLE vehicle_tires (
    id varchar(20) PRIMARY KEY DEFAULT generate_string_id('VTR'),
    vehicle_id varchar(20) REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Tire specifications (to be populated from CSV)
    tire_brand varchar(100),
    tire_model varchar(100),
    tire_size varchar(50),
    position varchar(20), -- front_left, front_right, rear_left, rear_right, etc.
    installation_date date,
    current_km integer,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create vehicle oils and filters table
CREATE TABLE vehicle_oils_filters (
    id varchar(20) PRIMARY KEY DEFAULT generate_string_id('VOF'),
    vehicle_id varchar(20) REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Oil and filter specifications (to be populated from CSV)
    oil_type varchar(100),
    oil_brand varchar(100),
    oil_capacity_liters decimal(5,2),
    filter_type varchar(100),
    filter_brand varchar(100),
    last_change_date date,
    last_change_km integer,
    next_change_km integer,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_vehicle_details_vehicle_id ON vehicle_details(vehicle_id);
CREATE INDEX idx_vehicle_engine_vehicle_id ON vehicle_engine_details(vehicle_id);
CREATE INDEX idx_vehicle_tires_vehicle_id ON vehicle_tires(vehicle_id);
CREATE INDEX idx_vehicle_oils_vehicle_id ON vehicle_oils_filters(vehicle_id);

-- Create a comprehensive view for vehicle information
CREATE OR REPLACE VIEW vehicle_complete_info AS
SELECT 
    v.id as vehicle_id,
    v.license_plate,
    v.make,
    v.model,
    v.year,
    v.status,
    
    -- Main details
    vd.registration_date,
    vd.chassis_number,
    vd.gross_weight_kg,
    vd.tare_weight_kg,
    vd.tire_size,
    vd.service_type,
    vd.typology,
    vd.emission_standard,
    vd.current_km,
    vd.monthly_km,
    vd.daily_average_km,
    vd.observations,
    
    -- Engine details
    ved.engine_type,
    ved.displacement_cc,
    ved.power_hp,
    ved.fuel_type,
    ved.transmission_type,
    
    -- Latest maintenance info
    vof.last_change_date as last_oil_change,
    vof.last_change_km as last_oil_change_km,
    vof.next_change_km as next_oil_change_km
    
FROM vehicles v
LEFT JOIN vehicle_details vd ON v.id = vd.vehicle_id
LEFT JOIN vehicle_engine_details ved ON v.id = ved.vehicle_id
LEFT JOIN vehicle_oils_filters vof ON v.id = vof.vehicle_id;

-- Enable RLS on new tables
ALTER TABLE vehicle_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_engine_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_tires ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_oils_filters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic read access for now)
CREATE POLICY "Allow read access to vehicle_details" ON vehicle_details FOR SELECT USING (true);
CREATE POLICY "Allow read access to vehicle_engine_details" ON vehicle_engine_details FOR SELECT USING (true);
CREATE POLICY "Allow read access to vehicle_tires" ON vehicle_tires FOR SELECT USING (true);
CREATE POLICY "Allow read access to vehicle_oils_filters" ON vehicle_oils_filters FOR SELECT USING (true);

-- Test the functions
SELECT 'Testing generate_string_id function:' as test;
SELECT generate_string_id('TEST') as test_id;
SELECT generate_string_id('VEH') as vehicle_id;
SELECT generate_string_id('VDT') as vehicle_detail_id;

-- Show the new table structures
SELECT 'New vehicle details structure created successfully!' as result;
