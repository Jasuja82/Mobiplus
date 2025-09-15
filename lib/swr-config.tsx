"use client"

import { SWRConfig } from "swr"
import type { ReactNode } from "react"

const fetcher = async (url: string) => {
  console.log(`[v0] SWR fetching: ${url}`)
  const startTime = performance.now()

  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }

  const data = await res.json()
  const endTime = performance.now()

  console.log(`[v0] SWR fetch completed: ${url} (${(endTime - startTime).toFixed(2)}ms)`)

  return data
}

const swrConfig = {
  fetcher,
  revalidateOnFocus: false, // Prevent unnecessary refetches on window focus
  revalidateOnReconnect: true, // Refetch when connection is restored
  refreshInterval: 0, // Disable automatic refresh by default
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 1000, // Wait 1 second between retries
  compare: (a: any, b: any) => {
    // Custom comparison to prevent unnecessary re-renders
    return JSON.stringify(a) === JSON.stringify(b)
  },
  onError: (error: Error, key: string) => {
    console.error(`[v0] SWR Error for ${key}:`, error)
  },
  onSuccess: (data: any, key: string) => {
    console.log(`[v0] SWR Success for ${key}`)
  },
}

interface SWRProviderProps {
  children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}
