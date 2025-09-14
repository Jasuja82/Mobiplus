import type { Database } from "./index"

// Re-export the Database type for Supabase
export type { Database }

// Supabase helper types
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

// Convenience type aliases for common operations
export type VehicleRow = Tables<"vehicles">
export type VehicleInsert = TablesInsert<"vehicles">
export type VehicleUpdate = TablesUpdate<"vehicles">

export type RefuelRecordRow = Tables<"refuel_records">
export type RefuelRecordInsert = TablesInsert<"refuel_records">
export type RefuelRecordUpdate = TablesUpdate<"refuel_records">

export type DriverRow = Tables<"drivers">
export type DriverInsert = TablesInsert<"drivers">
export type DriverUpdate = TablesUpdate<"drivers">

export type DepartmentRow = Tables<"departments">
export type DepartmentInsert = TablesInsert<"departments">
export type DepartmentUpdate = TablesUpdate<"departments">

export type LocationRow = Tables<"locations">
export type LocationInsert = TablesInsert<"locations">
export type LocationUpdate = TablesUpdate<"locations">

export type UserRow = Tables<"users">
export type UserInsert = TablesInsert<"users">
export type UserUpdate = TablesUpdate<"users">
