import { createServerSupabaseClient } from "./supabase"
import type {
  Department,
  Location,
  Driver,
  Vehicle,
  RefuelRecord,
  Assignment,
  Employee,
  FuelStation,
  FuelPricePerMonth,
  Make,
  Model,
  EngineType,
  VehicleDetails,
  LicenseType,
  AssignmentType,
} from "@/types/entities"

export type {
  Department,
  Location,
  Driver,
  Vehicle,
  RefuelRecord,
  Assignment,
  Employee,
  FuelStation,
  FuelPricePerMonth,
  Make,
  Model,
  EngineType,
  VehicleDetails,
  LicenseType,
  AssignmentType,
}

export class DatabaseService {
  private _supabase: ReturnType<typeof createServerSupabaseClient> | null = null

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createServerSupabaseClient()
    }
    return this._supabase
  }

  // Departments
  async getDepartments() {
    const { data, error } = await this.supabase.from("departments").select("*").order("name")

    if (error) throw error
    return data as Department[]
  }

  async getDepartment(id: string) {
    const { data, error } = await this.supabase.from("departments").select("*").eq("id", id).single()

    if (error) throw error
    return data as Department
  }

  async createDepartment(department: Omit<Department, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase.from("departments").insert(department).select().single()

    if (error) throw error
    return data as Department
  }

  async updateDepartment(id: string, updates: Partial<Department>) {
    const { data, error } = await this.supabase.from("departments").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as Department
  }

  async deleteDepartment(id: string) {
    const { error } = await this.supabase.from("departments").delete().eq("id", id)

    if (error) throw error
  }

  // Locations
  async getLocations() {
    const { data, error } = await this.supabase.from("locations").select("*").eq("is_active", true).order("name")

    if (error) throw error
    return data as Location[]
  }

  async getLocation(id: string) {
    const { data, error } = await this.supabase.from("locations").select("*").eq("id", id).single()

    if (error) throw error
    return data as Location
  }

  async createLocation(location: Omit<Location, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase.from("locations").insert(location).select().single()

    if (error) throw error
    return data as Location
  }

  async updateLocation(id: string, updates: Partial<Location>) {
    const { data, error } = await this.supabase.from("locations").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as Location
  }

  async deleteLocation(id: string) {
    const { error } = await this.supabase.from("locations").delete().eq("id", id)

    if (error) throw error
  }

  // Drivers
  async getDrivers(departmentId?: string) {
    let query = this.supabase.from("drivers").select("*").eq("status", "active")

    if (departmentId) {
      query = query.eq("department_id", departmentId)
    }

    const { data, error } = await query.order("name")

    if (error) throw error
    return data as Driver[]
  }

  async getDriver(id: string) {
    const { data, error } = await this.supabase.from("drivers").select("*").eq("id", id).single()

    if (error) throw error
    return data as Driver
  }

  async createDriver(driver: Omit<Driver, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase.from("drivers").insert(driver).select().single()

    if (error) throw error
    return data as Driver
  }

  async updateDriver(id: string, updates: Partial<Driver>) {
    const { data, error } = await this.supabase.from("drivers").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as Driver
  }

  async deleteDriver(id: string) {
    const { error } = await this.supabase.from("drivers").delete().eq("id", id)

    if (error) throw error
  }

  // Vehicles
  async getVehicles(departmentId?: string) {
    let query = this.supabase.from("vehicles").select("*").neq("status", "retired")

    if (departmentId) {
      query = query.eq("department_id", departmentId)
    }

    const { data, error } = await query.order("internal_number")

    if (error) throw error
    return data
  }

  async getVehicle(id: string) {
    const { data, error } = await this.supabase.from("vehicles").select("*").eq("id", id).single()

    if (error) throw error
    return data as Vehicle
  }

  async createVehicle(vehicle: Omit<Vehicle, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase.from("vehicles").insert(vehicle).select().single()

    if (error) throw error
    return data as Vehicle
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>) {
    const { data, error } = await this.supabase.from("vehicles").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as Vehicle
  }

  async deleteVehicle(id: string) {
    const { error } = await this.supabase.from("vehicles").delete().eq("id", id)

    if (error) throw error
  }

  // Refuel Records
  async getRefuelRecords(filters?: {
    vehicleId?: string
    driverId?: string
    departmentId?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  }) {
    let query = this.supabase.from("refuel_analytics").select("*")

    if (filters?.vehicleId) {
      query = query.eq("vehicle_id", filters.vehicleId)
    }

    if (filters?.driverId) {
      query = query.eq("driver_id", filters.driverId)
    }

    if (filters?.dateFrom) {
      query = query.gte("refuel_date", filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte("refuel_date", filters.dateTo)
    }

    const { data, error } = await query.order("refuel_date", { ascending: false }).limit(filters?.limit || 100)

    if (error) throw error
    return data
  }

  async getRefuelRecord(id: string) {
    const { data, error } = await this.supabase.from("refuel_records").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as RefuelRecord
  }

  async createRefuelRecord(record: Omit<RefuelRecord, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase.from("refuel_records").insert(record).select().single()

    if (error) throw error
    return data as RefuelRecord
  }

  async updateRefuelRecord(id: string, updates: Partial<RefuelRecord>) {
    const { data, error } = await this.supabase.from("refuel_records").update(updates).eq("id", id).select().single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as RefuelRecord
  }

  async deleteRefuelRecord(id: string) {
    const { error } = await this.supabase.from("refuel_records").delete().eq("id", id)

    if (error) {
      if (error.code === "PGRST116") return false
      throw error
    }
    return true
  }

  async bulkCreateRefuelRecords(records: Omit<RefuelRecord, "id" | "created_at" | "updated_at">[]) {
    const { data, error } = await this.supabase.from("refuel_records").insert(records).select()

    if (error) throw error
    return data as RefuelRecord[]
  }

  // Fuel Stations
  async getFuelStations() {
    const { data, error } = await this.supabase
      .from("fuel_stations")
      .select("*")
      .eq("status", "active")
      .order("location")

    if (error) throw error
    return data as FuelStation[]
  }

  async getFuelStation(id: string) {
    const { data, error } = await this.supabase.from("fuel_stations").select("*").eq("id", id).single()

    if (error) throw error
    return data as FuelStation
  }

  async createFuelStation(fuelStation: Omit<FuelStation, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase.from("fuel_stations").insert(fuelStation).select().single()

    if (error) throw error
    return data as FuelStation
  }

  // Assignments (real assignments, not types)
  async getAssignments() {
    const { data, error } = await this.supabase.from("assignments").select("*").eq("status", "active").order("name")

    if (error) throw error
    return data as Assignment[]
  }

  async createAssignment(assignment: Omit<Assignment, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase.from("assignments").insert(assignment).select().single()

    if (error) throw error
    return data as Assignment
  }

  // Reference data
  async getMakes() {
    const { data, error } = await this.supabase.from("makes").select("*").order("name")

    if (error) throw error
    return data as Make[]
  }

  async getModels(makeId?: string) {
    let query = this.supabase.from("models").select("*")

    if (makeId) {
      query = query.eq("make_id", makeId)
    }

    const { data, error } = await query.order("name")

    if (error) throw error
    return data as Model[]
  }

  async getEngineTypes() {
    const { data, error } = await this.supabase.from("engine_types").select("*").order("name")

    if (error) throw error
    return data as EngineType[]
  }

  async getLicenseTypes() {
    const { data, error } = await this.supabase.from("license_types").select("*").order("name")

    if (error) throw error
    return data as LicenseType[]
  }

  // Fuel Prices
  async getFuelPrices(year?: number, month?: number) {
    let query = this.supabase.from("fuel_price_per_month").select("*")

    if (year) {
      query = query.eq("year", year)
    }

    if (month) {
      query = query.eq("month", month)
    }

    const { data, error } = await query.order("year", { ascending: false }).order("month", { ascending: false })

    if (error) throw error
    return data as FuelPricePerMonth[]
  }

  async createFuelPrice(fuelPrice: Omit<FuelPricePerMonth, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase.from("fuel_price_per_month").insert(fuelPrice).select().single()

    if (error) throw error
    return data as FuelPricePerMonth
  }

  // Analytics
  async getFleetAnalytics(filters?: {
    departmentId?: string
    dateFrom?: string
    dateTo?: string
  }) {
    // Use the analytics views created in the database
    const { data: vehicleCount, error: vehicleError } = await this.supabase
      .from("vehicles")
      .select("id", { count: "exact" })
      .neq("status", "retired")

    const { data: refuelData, error: refuelError } = await this.supabase
      .from("refuel_records")
      .select("total_cost, liters, odometer_difference")
      .gte("refuel_date", filters?.dateFrom || "2024-01-01")
      .lte("refuel_date", filters?.dateTo || new Date().toISOString())

    if (vehicleError || refuelError) {
      throw vehicleError || refuelError
    }

    const totalCost = refuelData?.reduce((sum, record) => sum + (record.total_cost || 0), 0) || 0
    const totalLiters = refuelData?.reduce((sum, record) => sum + (record.liters || 0), 0) || 0
    const totalDistance = refuelData?.reduce((sum, record) => sum + (record.odometer_difference || 0), 0) || 0

    return {
      totalVehicles: vehicleCount?.length || 0,
      activeVehicles: vehicleCount?.length || 0,
      totalFuelCost: totalCost,
      avgFuelEfficiency: totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0,
      totalDistance,
      totalRefuels: refuelData?.length || 0,
    }
  }
}

export const db = new DatabaseService()
