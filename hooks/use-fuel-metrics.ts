"use client"

import useSWR from "swr"
import { usePerformanceMonitor } from "./use-performance-monitor"

interface FuelFilters {
  timePeriod?: string
  assignment?: string
  location?: string
  department?: string
  vehicle?: string
  startDate?: string
  endDate?: string
}

interface FuelMetrics {
  totalCost: number
  totalLiters: number
  averagePrice: number
  averageConsumption: number
  totalRefuels: number
  costChange: number
  litersChange: number
  refuelsChange: number
  monthlyTrends: any[]
  priceHistory: any[]
  vehicleEfficiency: any[]
  consumptionCorrelation: any[]
  stationCosts: any[]
  stationPrices: any[]
  vehicleRanking: any[]
  locations: any[]
  departments: any[]
  vehicles: any[]
  assignments: any[]
}

export function useFuelMetrics(filters: FuelFilters = {}) {
  const { logPerformance } = usePerformanceMonitor("FuelMetrics")

  const queryParams = new URLSearchParams({
    timePeriod: filters.timePeriod || "month",
    assignment: filters.assignment || "all",
    location: filters.location || "all",
    department: filters.department || "all",
    vehicle: filters.vehicle || "all",
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  })

  const swrKey = `/api/metrics/fuel?${queryParams.toString()}`

  const { data, error, isLoading, mutate } = useSWR<FuelMetrics>(swrKey, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnMount: true,
    dedupingInterval: 15000, // Dedupe for 15 seconds
    onSuccess: (data) => {
      logPerformance({
        componentName: "FuelMetrics",
        loadTime: 0,
        renderTime: performance.now(),
      })
    },
  })

  return {
    data,
    error,
    isLoading,
    mutate,
    refresh: () => mutate(),
    isValidating: !error && !data,
  }
}
