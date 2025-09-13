import { z } from "zod"
import { 
  VehicleFormSchema, 
  RefuelFormSchema, 
  MaintenanceScheduleFormSchema,
  DriverFormSchema,
  LocationFormSchema,
  DepartmentFormSchema
} from "@/types"
import type { 
  VehicleFormData, 
  RefuelFormData, 
  MaintenanceScheduleFormData,
  DriverFormData,
  LocationFormData,
  DepartmentFormData
} from "@/types"

// Re-export form schemas for consistency
export { 
  VehicleFormSchema, 
  RefuelFormSchema, 
  MaintenanceScheduleFormSchema,
  DriverFormSchema,
  LocationFormSchema,
  DepartmentFormSchema
}

// Validation utilities
export function validateVehicleForm(
  data: unknown,
): { success: true; data: VehicleFormData } | { success: false; errors: string[] } {
  try {
    const result = VehicleFormSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map((e) => e.message) }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}

export function validateRefuelForm(
  data: unknown,
): { success: true; data: RefuelFormData } | { success: false; errors: string[] } {
  try {
    const result = RefuelFormSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map((e) => e.message) }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}

export function validateMaintenanceForm(
  data: unknown,
): { success: true; data: MaintenanceScheduleFormData } | { success: false; errors: string[] } {
  try {
    const result = MaintenanceScheduleFormSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map((e) => e.message) }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}

export function validateDriverForm(
  data: unknown,
): { success: true; data: DriverFormData } | { success: false; errors: string[] } {
  try {
    const result = DriverFormSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map((e) => e.message) }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}

export function validateLocationForm(
  data: unknown,
): { success: true; data: LocationFormData } | { success: false; errors: string[] } {
  try {
    const result = LocationFormSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map((e) => e.message) }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}

export function validateDepartmentForm(
  data: unknown,
): { success: true; data: DepartmentFormData } | { success: false; errors: string[] } {
  try {
    const result = DepartmentFormSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map((e) => e.message) }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}