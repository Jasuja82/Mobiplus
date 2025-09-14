import type { z } from "zod"
import type {
  VehicleFormSchema,
  RefuelFormSchema,
  MaintenanceScheduleFormSchema,
  DriverFormSchema,
  LocationFormSchema,
  DepartmentFormSchema,
} from "./validation"

// Form data types inferred from validation schemas
export type VehicleFormData = z.infer<typeof VehicleFormSchema>
export type RefuelFormData = z.infer<typeof RefuelFormSchema>
export type MaintenanceScheduleFormData = z.infer<typeof MaintenanceScheduleFormSchema>
export type DriverFormData = z.infer<typeof DriverFormSchema>
export type LocationFormData = z.infer<typeof LocationFormSchema>
export type DepartmentFormData = z.infer<typeof DepartmentFormSchema>
