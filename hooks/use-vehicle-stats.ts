"use client"

import useSWR from "swr"
import { usePerformanceMonitor } from "./use-performance-monitor"

interface VehicleStats {
  total: number
  active: number
  maintenance: number
  inactive: number
}

export function useVehicleStats() {
  const { logPerformance } = usePerformanceMonitor("VehicleStats")

  const { data, error, isLoading, mutate } = useSWR<VehicleStats>("/api/vehicles/stats", {
    refreshInterval: 15000, // Refresh every 15 seconds
    revalidateOnMount: true,
    dedupingInterval: 5000, // Short dedupe interval
    onSuccess: (data) => {
      logPerformance({
        componentName: "VehicleStats",
        loadTime: 0,
        renderTime: performance.now(),
      })
    },
  })

  return {
    data: data || { total: 0, active: 0, maintenance: 0, inactive: 0 },
    error,
    isLoading,
    mutate,
    refresh: () => mutate(),
    isValidating: !error && !data,
  }
}
