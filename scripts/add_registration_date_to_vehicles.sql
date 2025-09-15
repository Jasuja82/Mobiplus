-- Add registration_date column to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS registration_date DATE;

-- Update existing vehicles to set registration_date based on purchase_date or year
UPDATE vehicles 
SET registration_date = CASE 
  WHEN purchase_date IS NOT NULL THEN purchase_date
  WHEN year IS NOT NULL THEN DATE(year || '-01-01')
  ELSE NULL
END
WHERE registration_date IS NULL;

-- Create a function to calculate vehicle age in years
CREATE OR REPLACE FUNCTION calculate_vehicle_age(registration_date DATE)
RETURNS INTEGER AS $$
BEGIN
  IF registration_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, registration_date));
END;
$$ LANGUAGE plpgsql;

-- Create a view for vehicles with calculated age
CREATE OR REPLACE VIEW vehicles_with_age AS
SELECT 
  v.*,
  calculate_vehicle_age(v.registration_date) as age_years,
  vc.name as category_name,
  d.name as department_name,
  hl.name as home_location_name
FROM vehicles v
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
LEFT JOIN departments d ON v.department_id = d.id  
LEFT JOIN locations hl ON v.home_location_id = hl.id;
