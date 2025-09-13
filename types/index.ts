// Main types export file - single source of truth for all types
export * from './entities'
export * from './relations'
export * from './forms'
export * from './api'
export * from './import'

// Re-export commonly used types for convenience
export type {
  User,
  Vehicle,
  Driver,
  RefuelRecord,
  Department,
  Location,
  MaintenanceSchedule,
  VehicleCategory
} from './entities'

export type {
  VehicleWithRelations,
  RefuelWithRelations,
  DriverWithRelations,
  MaintenanceWithRelations
} from './relations'

export type {
  VehicleFormData,
  RefuelFormData,
  DriverFormData,
  LocationFormData,
  DepartmentFormData
} from './forms'

export type {
  ApiResponse,
  FleetStats,
  FuelStats,
  MaintenanceStats,
  ImportResult
} from './api'

export type {
  CSVData,
  ColumnMapping,
  ImportStep,
  ValidationFlag,
  ImportSession
} from './import'

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
    }
  }
}