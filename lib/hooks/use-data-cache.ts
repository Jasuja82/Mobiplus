"use client"

import { useState, useEffect, useCallback } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

const cache = new Map<string, CacheEntry<any>>()

export function useDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    staleTime?: number
    cacheTime?: number
    refetchOnMount?: boolean
  } = {},
) {
  const { staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000, refetchOnMount = true } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(
    async (force = false) => {
      const cached = cache.get(key)
      const now = Date.now()

      // Return cached data if it's still fresh and not forced
      if (!force && cached && now - cached.timestamp < staleTime) {
        setData(cached.data)
        setIsLoading(false)
        return cached.data
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await fetcher()

        // Cache the result
        cache.set(key, {
          data: result,
          timestamp: now,
          expiry: now + cacheTime,
        })

        setData(result)
        return result
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [key, fetcher, staleTime, cacheTime],
  )

  useEffect(() => {
    if (refetchOnMount) {
      fetchData()
    }
  }, [fetchData, refetchOnMount])

  // Clean up expired cache entries
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      for (const [cacheKey, entry] of cache.entries()) {
        if (now > entry.expiry) {
          cache.delete(cacheKey)
        }
      }
    }, 60000) // Clean up every minute

    return () => clearInterval(cleanup)
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    mutate: (newData: T) => {
      setData(newData)
      cache.set(key, {
        data: newData,
        timestamp: Date.now(),
        expiry: Date.now() + cacheTime,
      })
    },
  }
}
