import type {
  ApiResponse,
  Vehicle,
  VehicleWithRelations,
  VehicleFormData,
  RefuelRecord,
  RefuelWithRelations,
  RefuelFormData,
  FleetStats,
  FuelStats,
  MaintenanceStats,
} from "@/types/database"

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000"

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Vehicle API methods
  async getVehicles(): Promise<ApiResponse<VehicleWithRelations[]>> {
    return this.request<VehicleWithRelations[]>("/vehicles")
  }

  async getVehicle(id: string): Promise<ApiResponse<VehicleWithRelations>> {
    return this.request<VehicleWithRelations>(`/vehicles/${id}`)
  }

  async createVehicle(data: VehicleFormData): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>("/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateVehicle(id: string, data: Partial<VehicleFormData>): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteVehicle(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/vehicles/${id}`, {
      method: "DELETE",
    })
  }

  // Refuel API methods
  async getRefuelRecords(): Promise<ApiResponse<RefuelWithRelations[]>> {
    return this.request<RefuelWithRelations[]>("/refuel-records")
  }

  async createRefuelRecord(data: RefuelFormData): Promise<ApiResponse<RefuelRecord>> {
    return this.request<RefuelRecord>("/refuel-records", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Analytics API methods
  async getFleetStats(): Promise<ApiResponse<FleetStats>> {
    return this.request<FleetStats>("/analytics")
  }

  async getFuelStats(): Promise<ApiResponse<FuelStats>> {
    return this.request<FuelStats>("/analytics/fuel")
  }

  async getMaintenanceStats(): Promise<ApiResponse<MaintenanceStats>> {
    return this.request<MaintenanceStats>("/analytics/maintenance")
  }

  // Admin API methods
  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.request<any>("/admin/system-stats")
  }

  async getAuditLogs(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/admin/audit-logs")
  }

  async getUsers(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/admin/users")
  }
}

export const apiClient = new ApiClient()
