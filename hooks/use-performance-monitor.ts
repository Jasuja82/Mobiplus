"use client"

import { useEffect, useCallback } from "react"
import { authService } from "@/lib/auth"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  componentName: string
  userId?: string
  timestamp: number
}

export function usePerformanceMonitor(componentName: string) {
  const logPerformance = useCallback(
    async (metrics: Omit<PerformanceMetrics, "userId" | "timestamp">) => {
      try {
        const userResponse = await authService.getCurrentUser()
        const userId = userResponse.success ? userResponse.data?.id : undefined

        const performanceData: PerformanceMetrics = {
          ...metrics,
          userId,
          timestamp: Date.now(),
        }

        if (userId) {
          console.group(`[v0] Performance Report - ${componentName}`)
          console.log(`Load Time: ${metrics.loadTime}ms`)
          console.log(`Render Time: ${metrics.renderTime}ms`)
          console.log(`User ID: ${userId}`)
          console.log(`Timestamp: ${new Date(performanceData.timestamp).toISOString()}`)

          // Check for performance issues
          if (metrics.loadTime > 1000) {
            console.warn(`⚠️ Slow load time detected: ${metrics.loadTime}ms`)
          }
          if (metrics.renderTime > 100) {
            console.warn(`⚠️ Slow render time detected: ${metrics.renderTime}ms`)
          }

          console.groupEnd()
        }

        // In production, you could send this to an analytics service
        // await fetch('/api/performance', { method: 'POST', body: JSON.stringify(performanceData) })
      } catch (error) {
        console.error("[v0] Performance monitoring error:", error)
      }
    },
    [componentName],
  )

  useEffect(() => {
    const startTime = performance.now()
    const renderStartTime = performance.now()

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name.includes(componentName)) {
          logPerformance({
            componentName,
            loadTime: entry.duration,
            renderTime: performance.now() - renderStartTime,
          })
        }
      })
    })

    observer.observe({ entryTypes: ["measure", "navigation"] })

    return () => {
      const endTime = performance.now()
      logPerformance({
        componentName,
        loadTime: endTime - startTime,
        renderTime: endTime - renderStartTime,
      })
      observer.disconnect()
    }
  }, [componentName, logPerformance])

  return { logPerformance }
}
