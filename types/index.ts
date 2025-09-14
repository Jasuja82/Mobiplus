// Import types for use in Database type
import type { User } from './entities/User'
import type { Vehicle } from './entities/Vehicle'
import type { Driver } from './entities/Driver'
import type { RefuelRecord } from './entities/RefuelRecord'
import type { Department } from './entities/Department'
import type { Location } from './entities/Location'
import type { MaintenanceSchedule } from './entities/MaintenanceSchedule'
import type { VehicleCategory } from './entities/VehicleCategory'
import type { MaintenanceCategory } from './entities/MaintenanceCategory'
import type { AssignmentType } from './entities/AssignmentType'

// Database type for Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<User>
      }
      vehicles: {
        Row: Vehicle
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Vehicle>
      }
      refuel_records: {
        Row: RefuelRecord
        Insert: Omit<RefuelRecord, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<RefuelRecord>
      }
      drivers: {
        Row: Driver
        Insert: Omit<Driver, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Driver>
      }
      departments: {
        Row: Department
        Insert: Omit<Department, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Department>
      }
      locations: {
        Row: Location
        Insert: Omit<Location, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Location>
      }
      maintenance_schedules: {
        Row: MaintenanceSchedule
        Insert: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<MaintenanceSchedule>
      }
      vehicle_categories: {
        Row: VehicleCategory
        Insert: Omit<VehicleCategory, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<VehicleCategory>
      }
      maintenance_categories: {
        Row: MaintenanceCategory
        Insert: Omit<MaintenanceCategory, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<MaintenanceCategory>
      }
      assignment_types: {
        Row: AssignmentType
        Insert: Omit<AssignmentType, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<AssignmentType>
      }
    }
  }
}

// Import and re-export all entity types
export type { User } from './entities/User'
export type { Vehicle } from './entities/Vehicle'
export type { Driver } from './entities/Driver'
export type { RefuelRecord } from './entities/RefuelRecord'
export type { Department } from './entities/Department'
export type { Location } from './entities/Location'
export type { MaintenanceSchedule } from './entities/MaintenanceSchedule'
export type { VehicleCategory } from './entities/VehicleCategory'
export type { MaintenanceCategory } from './entities/MaintenanceCategory'
export type { AssignmentType } from './entities/AssignmentType'

// Import and re-export all relation types
export * from './relations'
// Import and re-export all form types
export * from './forms'
// Import and re-export all API types
export * from './api'
// Import and re-export all import types
export * from './import'
