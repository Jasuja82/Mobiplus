import { z } from "zod"

export const VehicleFormSchema = z.object({
  license_plate: z.string().min(1, "Matrícula é obrigatória"),
  make: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z
    .number()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  vin: z.string().optional(),
  category_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  fuel_type: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
  fuel_capacity: z.number().positive().optional(),
  status: z.enum(["active", "maintenance", "inactive", "retired"]),
  purchase_date: z.string().optional(),
  purchase_price: z.number().positive().optional(),
  current_mileage: z.number().min(0),
  insurance_policy: z.string().optional(),
  insurance_expiry: z.string().optional(),
  inspection_expiry: z.string().optional(),
  notes: z.string().optional(),
})

export const RefuelFormSchema = z.object({
  vehicle_id: z.string().uuid("Veículo é obrigatório"),
  driver_id: z.string().uuid().optional(),
  refuel_date: z.string().min(1, "Data é obrigatória"),
  mileage: z.number().min(0, "Quilometragem deve ser positiva"),
  liters: z.number().positive("Litros deve ser positivo"),
  cost_per_liter: z.number().positive("Preço por litro deve ser positivo"),
  fuel_station: z.string().optional(),
  receipt_number: z.string().optional(),
  notes: z.string().optional(),
})

export const MaintenanceScheduleFormSchema = z.object({
  vehicle_id: z.string().uuid("Veículo é obrigatório"),
  category_id: z.string().uuid().optional(),
  scheduled_date: z.string().min(1, "Data é obrigatória"),
  scheduled_mileage: z.number().min(0).optional(),
  priority: z.number().min(1).max(5),
  estimated_cost: z.number().positive().optional(),
  notes: z.string().optional(),
})

export const DriverFormSchema = z.object({
  user_id: z.string().uuid("Utilizador é obrigatório"),
  license_number: z.string().min(1, "Número da carta é obrigatório"),
  license_categories: z.array(z.string()).min(1, "Pelo menos uma categoria é obrigatória"),
  license_expiry: z.string().min(1, "Data de validade da carta é obrigatória"),
  medical_certificate_expiry: z.string().min(1, "Data de validade do certificado médico é obrigatória"),
  department_id: z.string().uuid("Departamento é obrigatório"),
  is_active: z.boolean(),
  notes: z.string().optional(),
})

export const LocationFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  internal_number: z.string().optional(),
  is_active: z.boolean(),
})

export const DepartmentFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  manager_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
})
