// Types with relations for complex queries
import type { Vehicle } from "./entities/Vehicle"
import type { VehicleCategory } from "./entities/VehicleCategory"
import type { Department } from "./entities/Department"
import type { RefuelRecord } from "./entities/RefuelRecord"
import type { Driver } from "./entities/Driver"
import type { User } from "./entities/User"
import type { MaintenanceSchedule } from "./entities/MaintenanceSchedule"
import type { MaintenanceCategory } from "./entities/MaintenanceCategory"
import type { VehicleAssignment } from "./entities/VehicleAssignment"
import type { FuelStation } from "./entities/FuelStation"
import type { Location } from "./entities/Location"
import type { MaintenanceIntervention } from "./entities/MaintenanceIntervention"

export interface VehicleWithRelations extends Vehicle {
  category?: VehicleCategory
  department?: Department
  home_location?: Location
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

export interface MaintenanceInterventionWithRelations extends MaintenanceIntervention {
  vehicle?: Vehicle
  schedule?: MaintenanceSchedule
  technician?: User
  created_by_user?: User
}
