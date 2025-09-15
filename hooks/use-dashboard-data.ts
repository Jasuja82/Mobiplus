"use client"

import useSWR from "swr"
import { usePerformanceMonitor } from "./use-performance-monitor"

interface DashboardFilters {
  timePeriod?: string
  assignment?: string
  location?: string
  department?: string
  vehicle?: string
  startDate?: string
  endDate?: string
}

interface DashboardData {
  locations: Array<{ id: string; name: string }>
  departments: Array<{ id: string; name: string }>
  vehicles: Array<{ id: string; license_plate: string }>
  assignments: Array<{ id: string; name: string }>
  analytics: {
    totalCost: number
    totalFuel: number
    totalMaintenance: number
    totalKilometers: number
    costChange: number
    fuelChange: number
    maintenanceChange: number
    kilometersChange: number
    fuel: any[]
    maintenance: any[]
    fleet: any[]
  }
}

export function useDashboardData(filters: DashboardFilters = {}) {
  const { logPerformance } = usePerformanceMonitor("DashboardData")

  const queryParams = new URLSearchParams({
    timePeriod: filters.timePeriod || "month",
    assignment: filters.assignment || "all",
    location: filters.location || "all",
    department: filters.department || "all",
    vehicle: filters.vehicle || "all",
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  })

  const swrKey = `/api/analytics/dashboard?${queryParams.toString()}`

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(swrKey, {
    refreshInterval: 30000, // Refresh every 30 seconds for real-time feel
    revalidateOnMount: true,
    dedupingInterval: 10000, // Dedupe for 10 seconds
    onSuccess: (data) => {
      logPerformance({
        componentName: "DashboardData",
        loadTime: 0, // SWR handles timing
        renderTime: performance.now(),
      })
    },
  })

  return {
    data,
    error,
    isLoading,
    mutate, // For manual cache invalidation
    refresh: () => mutate(),
    isValidating: !error && !data,
  }
}
