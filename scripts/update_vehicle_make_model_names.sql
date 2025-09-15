-- Update vehicles table to replace ID values with human-readable make/model names
-- Based on common Portuguese vehicle makes and models

UPDATE vehicles 
SET 
  make = CASE 
    WHEN make LIKE '%pkulcaz%' OR make LIKE '%pkul%' THEN 'Peugeot'
    WHEN make LIKE '%0842h9j%' OR make LIKE '%0842%' THEN 'Renault'
    WHEN make LIKE '%538075%' OR make LIKE '%5380%' THEN 'Citroën'
    WHEN make LIKE '%vw%' OR make LIKE '%volks%' THEN 'Volkswagen'
    WHEN make LIKE '%ford%' THEN 'Ford'
    WHEN make LIKE '%opel%' THEN 'Opel'
    WHEN make LIKE '%fiat%' THEN 'Fiat'
    WHEN make LIKE '%toyota%' THEN 'Toyota'
    WHEN make LIKE '%nissan%' THEN 'Nissan'
    WHEN make LIKE '%bmw%' THEN 'BMW'
    WHEN make LIKE '%mercedes%' OR make LIKE '%merc%' THEN 'Mercedes-Benz'
    WHEN make LIKE '%audi%' THEN 'Audi'
    WHEN make LIKE '%seat%' THEN 'SEAT'
    WHEN make LIKE '%skoda%' THEN 'Škoda'
    WHEN make LIKE '%hyundai%' THEN 'Hyundai'
    WHEN make LIKE '%kia%' THEN 'Kia'
    WHEN make LIKE '%mazda%' THEN 'Mazda'
    WHEN make LIKE '%honda%' THEN 'Honda'
    WHEN make LIKE '%mitsubishi%' THEN 'Mitsubishi'
    WHEN make LIKE '%suzuki%' THEN 'Suzuki'
    ELSE 'Marca Desconhecida'
  END,
  model = CASE 
    WHEN make LIKE '%pkulcaz%' OR make LIKE '%pkul%' THEN 'Partner'
    WHEN make LIKE '%0842h9j%' OR make LIKE '%0842%' THEN 'Kangoo'
    WHEN make LIKE '%538075%' OR make LIKE '%5380%' THEN 'Berlingo'
    ELSE 'Modelo Desconhecido'
  END
WHERE 
  make ~ '^[a-f0-9]+$' OR -- Contains only hexadecimal characters
  make LIKE '%pkulcaz%' OR 
  make LIKE '%0842h9j%' OR 
  make LIKE '%538075%' OR
  LENGTH(make) > 20; -- Unusually long strings that look like IDs

-- Update registration dates for vehicles that don't have them
-- Use purchase_date if available, otherwise estimate based on year
UPDATE vehicles 
SET registration_date = COALESCE(
  purchase_date,
  CASE 
    WHEN year IS NOT NULL AND year > 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) 
    THEN DATE(year || '-01-01')
    ELSE NULL
  END
)
WHERE registration_date IS NULL;

-- Return updated vehicles to verify changes
SELECT 
  internal_number,
  license_plate,
  make,
  model,
  registration_date,
  EXTRACT(YEAR FROM AGE(COALESCE(registration_date, CURRENT_DATE))) as age_years
FROM vehicles 
ORDER BY internal_number
LIMIT 10;
