import { createServerSupabaseClient } from "./supabase"

export interface Department {
  id: string
  name: string
  description: string | null
  budget: number | null
  manager_id: string | null
  location_id: string | null
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  region: string | null
  country: string | null
  coordinates: any | null
  internal_number: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  employee_number: string
  name: string
  email: string | null
  phone: string | null
  license_number: string | null
  license_expiry: string | null
  department_id: string | null
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
  department?: Department
}

export interface Vehicle {
  id: string
  internal_number: string
  name: string | null
  license_plate: string
  make: string | null
  model: string | null
  year: number | null
  fuel_type: "diesel" | "gasoline" | "electric" | "hybrid"
  tank_capacity: number | null
  department_id: string | null
  home_location_id: string | null
  status: "active" | "inactive" | "maintenance" | "retired"
  odometer_reading: number
  created_at: string
  updated_at: string
  department?: Department
  home_location?: Location
}

export interface RefuelRecord {
  id: string
  vehicle_id: string
  driver_id: string | null
  location_id: string | null
  refuel_date: string
  refuel_time: string | null
  liters: number
  cost_per_liter: number | null
  total_cost: number | null
  odometer_reading: number
  distance_since_last: number | null
  fuel_efficiency: number | null
  notes: string | null
  created_at: string
  updated_at: string
  vehicle?: Vehicle
  driver?: Driver
  location?: Location
}

export interface MaintenanceRecord {
  id: string
  vehicle_id: string
  maintenance_type: string
  description: string
  scheduled_date: string | null
  completed_date: string | null
  odometer_reading: number | null
  cost: number | null
  technician_name: string | null
  notes: string | null
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  vehicle?: Vehicle
}

export interface AssignmentType {
  id: string
  name: string
  description: string | null
  created_at: string
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
  async getLocations(type?: Location["location_type"]) {
    const query = this.supabase.from("locations").select("*").eq("is_active", true)

    const { data, error } = await query.order("name")

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
    let query = this.supabase
      .from("drivers")
      .select(`
        *,
        department:departments(*)
      `)
      .eq("status", "active")

    if (departmentId) {
      query = query.eq("department_id", departmentId)
    }

    const { data, error } = await query.order("name")

    if (error) throw error
    return data as Driver[]
  }

  async createDriver(driver: Omit<Driver, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase
      .from("drivers")
      .insert(driver)
      .select(`
        *,
        department:departments(*)
      `)
      .single()

    if (error) throw error
    return data as Driver
  }

  // Vehicles
  async getVehicles(departmentId?: string) {
    let query = this.supabase
      .from("vehicles")
      .select(`
        *,
        department:departments(*),
        home_location:locations(*)
      `)
      .neq("status", "retired")

    if (departmentId) {
      query = query.eq("department_id", departmentId)
    }

    const { data, error } = await query.order("internal_number")

    if (error) throw error
    return data as Vehicle[]
  }

  async createVehicle(vehicle: Omit<Vehicle, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase
      .from("vehicles")
      .insert(vehicle)
      .select(`
        *,
        department:departments(*),
        home_location:locations(*)
      `)
      .single()

    if (error) throw error
    return data as Vehicle
  }

  async getVehicle(id: string) {
    const { data, error } = await this.supabase
      .from("vehicles")
      .select(`
        *,
        department:departments(*),
        home_location:locations(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Vehicle
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>) {
    const { data, error } = await this.supabase
      .from("vehicles")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        department:departments(*),
        home_location:locations(*)
      `)
      .single()

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
    let query = this.supabase.from("refuel_records").select(`
        *,
        vehicle:vehicles(*),
        driver:drivers(*),
        location:locations(*)
      `)

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

    if (filters?.departmentId) {
      query = query.eq("vehicle.department_id", filters.departmentId)
    }

    const { data, error } = await query
      .order("refuel_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(filters?.limit || 100)

    if (error) throw error
    return data as RefuelRecord[]
  }

  async createRefuelRecord(record: Omit<RefuelRecord, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase
      .from("refuel_records")
      .insert(record)
      .select(`
        *,
        vehicle:vehicles(*),
        driver:drivers(*),
        location:locations(*)
      `)
      .single()

    if (error) throw error
    return data as RefuelRecord
  }

  async bulkCreateRefuelRecords(records: Omit<RefuelRecord, "id" | "created_at" | "updated_at">[]) {
    const { data, error } = await this.supabase.from("refuel_records").insert(records).select()

    if (error) throw error
    return data as RefuelRecord[]
  }

  // Analytics
  async getFleetAnalytics(filters?: {
    departmentId?: string
    dateFrom?: string
    dateTo?: string
  }) {
    // This would typically be a more complex query or stored procedure
    // For now, we'll return mock data structure
    return {
      totalVehicles: 45,
      activeVehicles: 42,
      totalFuelCost: 28450.75,
      avgFuelEfficiency: 8.2,
      maintenanceCost: 12300.5,
      totalDistance: 125430,
      trends: {
        fuelCost: 5.2,
        efficiency: -2.1,
        maintenance: 8.7,
        distance: 3.4,
      },
    }
  }

  async getDepartmentAnalytics(departmentId: string, dateFrom: string, dateTo: string) {
    const { data, error } = await this.supabase.rpc("get_department_analytics", {
      dept_id: departmentId,
      date_from: dateFrom,
      date_to: dateTo,
    })

    if (error) throw error
    return data
  }

  async getAssignmentTypes() {
    const { data, error } = await this.supabase.from("assignment_types").select("*").order("name")

    if (error) throw error
    return data as AssignmentType[]
  }

  async getAssignmentType(id: string) {
    const { data, error } = await this.supabase.from("assignment_types").select("*").eq("id", id).single()

    if (error) throw error
    return data as AssignmentType
  }

  async createAssignmentType(assignmentType: Omit<AssignmentType, "id" | "created_at">) {
    const { data, error } = await this.supabase.from("assignment_types").insert(assignmentType).select().single()

    if (error) throw error
    return data as AssignmentType
  }

  async updateAssignmentType(id: string, updates: Partial<AssignmentType>) {
    const { data, error } = await this.supabase.from("assignment_types").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as AssignmentType
  }

  async deleteAssignmentType(id: string) {
    const { error } = await this.supabase.from("assignment_types").delete().eq("id", id)

    if (error) throw error
  }
}

export const db = new DatabaseService()
