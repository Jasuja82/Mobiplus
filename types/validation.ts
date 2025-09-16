import { z } from "zod"

export const VehicleFormSchema = z.object({
  internal_number: z.string().min(1, "Número interno é obrigatório"),
  license_plate: z.string().min(1, "Matrícula é obrigatória"),
  make_id: z.string().optional(),
  model_id: z.string().optional(),
  vehicle_details_id: z.string().optional(),
  engine_type_id: z.string().optional(),
  assignment_id: z.string().optional(),
  status: z.enum(["active", "maintenance", "retired", "reserved"]),
  notes: z.string().optional(),
  year: z
    .number()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .optional(),
  vin: z.string().optional(),
  fuel_capacity: z.number().positive().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().positive().optional(),
  current_mileage: z.number().min(0),
  insurance_expiry: z.string().optional(),
  inspection_expiry: z.string().optional(),
  department_id: z.string().optional(),
  home_location_id: z.string().optional(),
  current_location_id: z.string().optional(),
})

export const RefuelFormSchema = z.object({
  vehicle_id: z.string().min(1, "Veículo é obrigatório"),
  driver_id: z.string().min(1, "Condutor é obrigatório"),
  fuel_station_id: z.string().optional(),
  refuel_date: z.string().min(1, "Data é obrigatória"),
  odometer_reading: z.number().min(0, "Quilometragem deve ser positiva"),
  liters: z.number().positive("Litros deve ser positivo"),
  cost_per_liter: z.number().positive("Preço por litro deve ser positivo"),
  receipt_number: z.string().optional(),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
  is_full_tank: z.boolean().default(true),
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
  internal_number: z.string().min(1, "Número interno é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  dob: z.string().optional(),
  license_type_id: z.string().optional(),
  status: z.string().default("active"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  hire_date: z.string().optional(),
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

export const FuelStationFormSchema = z.object({
  internal_number: z.string().min(1, "Número interno é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
  status: z.string().default("active"),
  notes: z.string().optional(),
  brand: z.string().optional(),
  address: z.string().optional(),
  location_id: z.string().optional(),
})

export const AssignmentFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  status: z.string().default("active"),
  notes: z.string().optional(),
})

export const EmployeeFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  department_id: z.string().optional(),
  type_id: z.string().optional(),
  hire_date: z.string().optional(),
  dob: z.string().optional(),
  employee_number: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.string().default("active"),
})
