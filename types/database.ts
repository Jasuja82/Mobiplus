export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          employee_number: number | null
          department: string
          role: "fleet_manager" | "maintenance_tech" | "admin" | "driver"
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          employee_number?: number | null
          department?: string
          role?: "fleet_manager" | "maintenance_tech" | "admin" | "driver"
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          employee_number?: number | null
          department?: string
          role?: "fleet_manager" | "maintenance_tech" | "admin" | "driver"
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          budget: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          budget?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          budget?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          license_plate: string
          make: string
          model: string
          year: number
          vin: string | null
          category_id: string | null
          department_id: string | null
          fuel_type: "gasoline" | "diesel" | "electric" | "hybrid"
          fuel_capacity: number | null
          status: "active" | "maintenance" | "inactive" | "retired"
          purchase_date: string | null
          purchase_price: number | null
          current_mileage: number
          insurance_policy: string | null
          insurance_expiry: string | null
          inspection_expiry: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          license_plate: string
          make: string
          model: string
          year: number
          vin?: string | null
          category_id?: string | null
          department_id?: string | null
          fuel_type?: "gasoline" | "diesel" | "electric" | "hybrid"
          fuel_capacity?: number | null
          status?: "active" | "maintenance" | "inactive" | "retired"
          purchase_date?: string | null
          purchase_price?: number | null
          current_mileage?: number
          insurance_policy?: string | null
          insurance_expiry?: string | null
          inspection_expiry?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          license_plate?: string
          make?: string
          model?: string
          year?: number
          vin?: string | null
          category_id?: string | null
          department_id?: string | null
          fuel_type?: "gasoline" | "diesel" | "electric" | "hybrid"
          fuel_capacity?: number | null
          status?: "active" | "maintenance" | "inactive" | "retired"
          purchase_date?: string | null
          purchase_price?: number | null
          current_mileage?: number
          insurance_policy?: string | null
          insurance_expiry?: string | null
          inspection_expiry?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_assignments: {
        Row: {
          id: string
          vehicle_id: string
          driver_id: string
          assigned_at: string
          assigned_by: string | null
          unassigned_at: string | null
          is_active: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          vehicle_id: string
          driver_id: string
          assigned_at: string
          assigned_by?: string | null
          unassigned_at?: string | null
          is_active?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          vehicle_id?: string
          driver_id?: string
          assigned_at?: string
          assigned_by?: string | null
          unassigned_at?: string | null
          is_active?: boolean
          notes?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          region: string | null
          country: string | null
          coordinates: any | null // PostGIS POINT type
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          region?: string | null
          country?: string | null
          coordinates?: any | null // PostGIS POINT type
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          region?: string | null
          country?: string | null
          coordinates?: any | null // PostGIS POINT type
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      fuel_stations: {
        Row: {
          id: string
          name: string
          brand: string | null
          location_id: string | null
          address: string | null
          coordinates: any | null // PostGIS POINT type
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          location_id?: string | null
          address?: string | null
          coordinates?: any | null // PostGIS POINT type
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          location_id?: string | null
          address?: string | null
          coordinates?: any | null // PostGIS POINT type
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      refuel_records: {
        Row: {
          id: string
          vehicle_id: string
          driver_id: string | null
          refuel_date: string
          mileage: number
          liters: number
          cost_per_liter: number
          total_cost: number
          fuel_station: string | null
          receipt_number: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          driver_id?: string | null
          refuel_date: string
          mileage: number
          liters: number
          cost_per_liter: number
          total_cost: number
          fuel_station?: string | null
          receipt_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          driver_id?: string | null
          refuel_date?: string
          mileage?: number
          liters?: number
          cost_per_liter?: number
          total_cost?: number
          fuel_station?: string | null
          receipt_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          user_id: string | null
          license_number: string
          license_expiry: string
          license_categories: string[] | null
          medical_certificate_expiry: string | null
          department_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          license_number: string
          license_expiry: string
          license_categories?: string[] | null
          medical_certificate_expiry?: string | null
          department_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          license_number?: string
          license_expiry?: string
          license_categories?: string[] | null
          medical_certificate_expiry?: string | null
          department_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          default_interval_km: number | null
          default_interval_months: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          default_interval_km?: number | null
          default_interval_months?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          default_interval_km?: number | null
          default_interval_months?: number | null
          created_at?: string
        }
      }
      maintenance_schedules: {
        Row: {
          id: string
          vehicle_id: string
          category_id: string | null
          scheduled_date: string
          scheduled_mileage: number | null
          status: "scheduled" | "in_progress" | "completed" | "cancelled"
          priority: number
          estimated_cost: number | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          category_id?: string | null
          scheduled_date: string
          scheduled_mileage?: number | null
          status?: "scheduled" | "in_progress" | "completed" | "cancelled"
          priority?: number
          estimated_cost?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          category_id?: string | null
          scheduled_date?: string
          scheduled_mileage?: number | null
          status?: "scheduled" | "in_progress" | "completed" | "cancelled"
          priority?: number
          estimated_cost?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_interventions: {
        Row: {
          id: string
          schedule_id: string | null
          vehicle_id: string
          intervention_date: string
          mileage: number
          description: string
          work_performed: string | null
          parts_used: string | null
          labor_hours: number | null
          parts_cost: number | null
          labor_cost: number | null
          total_cost: number | null
          technician_id: string | null
          supplier: string | null
          invoice_number: string | null
          warranty_until: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          schedule_id?: string | null
          vehicle_id: string
          intervention_date: string
          mileage: number
          description: string
          work_performed?: string | null
          parts_used?: string | null
          labor_hours?: number | null
          parts_cost?: number | null
          labor_cost?: number | null
          total_cost?: number | null
          technician_id?: string | null
          supplier?: string | null
          invoice_number?: string | null
          warranty_until?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string | null
          vehicle_id?: string
          intervention_date?: string
          mileage?: number
          description?: string
          work_performed?: string | null
          parts_used?: string | null
          labor_hours?: number | null
          parts_cost?: number | null
          labor_cost?: number | null
          total_cost?: number | null
          technician_id?: string | null
          supplier?: string | null
          invoice_number?: string | null
          warranty_until?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"]
export type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"]
export type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"]

export type Department = Database["public"]["Tables"]["departments"]["Row"]
export type VehicleCategory = Database["public"]["Tables"]["vehicle_categories"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]

export type RefuelRecord = Database["public"]["Tables"]["refuel_records"]["Row"]
export type RefuelRecordInsert = Database["public"]["Tables"]["refuel_records"]["Insert"]
export type RefuelRecordUpdate = Database["public"]["Tables"]["refuel_records"]["Update"]

export type Driver = Database["public"]["Tables"]["drivers"]["Row"]
export type DriverInsert = Database["public"]["Tables"]["drivers"]["Insert"]
export type DriverUpdate = Database["public"]["Tables"]["drivers"]["Update"]

export type MaintenanceCategory = Database["public"]["Tables"]["maintenance_categories"]["Row"]
export type MaintenanceCategoryInsert = Database["public"]["Tables"]["maintenance_categories"]["Insert"]

export type MaintenanceSchedule = Database["public"]["Tables"]["maintenance_schedules"]["Row"]
export type MaintenanceScheduleInsert = Database["public"]["Tables"]["maintenance_schedules"]["Insert"]
export type MaintenanceScheduleUpdate = Database["public"]["Tables"]["maintenance_schedules"]["Update"]

export type MaintenanceIntervention = Database["public"]["Tables"]["maintenance_interventions"]["Row"]
export type MaintenanceInterventionInsert = Database["public"]["Tables"]["maintenance_interventions"]["Insert"]
export type MaintenanceInterventionUpdate = Database["public"]["Tables"]["maintenance_interventions"]["Update"]

export type VehicleAssignment = Database["public"]["Tables"]["vehicle_assignments"]["Row"]
export type VehicleAssignmentInsert = Database["public"]["Tables"]["vehicle_assignments"]["Insert"]
export type VehicleAssignmentUpdate = Database["public"]["Tables"]["vehicle_assignments"]["Update"]

export type Location = Database["public"]["Tables"]["locations"]["Row"]
export type LocationInsert = Database["public"]["Tables"]["locations"]["Insert"]
export type LocationUpdate = Database["public"]["Tables"]["locations"]["Update"]

export type FuelStation = Database["public"]["Tables"]["fuel_stations"]["Row"]
export type FuelStationInsert = Database["public"]["Tables"]["fuel_stations"]["Insert"]
export type FuelStationUpdate = Database["public"]["Tables"]["fuel_stations"]["Update"]

import { z } from "zod"

// Form validation schemas
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

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface VehicleWithRelations extends Vehicle {
  category?: VehicleCategory
  department?: Department
}

export interface RefuelWithRelations extends RefuelRecord {
  vehicle?: Vehicle
  driver?: Driver & { user?: User }
}

export interface MaintenanceWithRelations extends MaintenanceSchedule {
  vehicle?: Vehicle
  category?: MaintenanceCategory
  created_by_user?: User
}

export interface DriverWithRelations extends Driver {
  user?: User
  department?: Department
}

export interface VehicleAssignmentWithRelations extends VehicleAssignment {
  vehicle?: Vehicle
  driver?: DriverWithRelations
  assigned_by_user?: User
}

export interface FuelStationWithRelations extends FuelStation {
  location?: Location
}

// Statistics types
export interface FleetStats {
  totalVehicles: number
  activeVehicles: number
  maintenanceVehicles: number
  inactiveVehicles: number
  totalFuelCost: number
  totalMaintenanceCost: number
  averageFuelConsumption: number
}

export interface FuelStats {
  totalCost: number
  totalLiters: number
  averageCostPerLiter: number
  totalRefuels: number
  monthlyData: Array<{
    month: string
    cost: number
    liters: number
    refuels: number
  }>
}

export interface MaintenanceStats {
  totalCost: number
  scheduledCount: number
  completedCount: number
  overdueCount: number
  monthlyData: Array<{
    month: string
    cost: number
    interventions: number
  }>
}

// Form data types
export type VehicleFormData = z.infer<typeof VehicleFormSchema>
export type RefuelFormData = z.infer<typeof RefuelFormSchema>
export type MaintenanceScheduleFormData = z.infer<typeof MaintenanceScheduleFormSchema>
