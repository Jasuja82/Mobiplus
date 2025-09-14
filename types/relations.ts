// Types with relations for complex queries
import type {
  Vehicle,
  VehicleCategory,
  Department,
  RefuelRecord,
  Driver,
  User,
  MaintenanceSchedule,
  MaintenanceCategory,
  VehicleAssignment,
  FuelStation,
  Location,
  MaintenanceIntervention
} from './entities'

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
