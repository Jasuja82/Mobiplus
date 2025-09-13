"use client"

import { useState, useEffect } from "react"
import { fleetSignals } from "@/lib/signals"

export function useFleetSignal<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    const signal = fleetSignals.createSignal(key, initialValue)
    setValue(signal.value)

    const unsubscribe = signal.subscribe((newValue) => {
      setValue(newValue)
    })

    return unsubscribe
  }, [key, initialValue])

  const updateValue = (newValue: T) => {
    const signal = fleetSignals.createSignal(key, initialValue)
    signal.set(newValue)
  }

  return [value, updateValue]
}

export function useFleetAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = fleetSignals.subscribeToAlerts((newAlerts) => {
      setAlerts(newAlerts)
    })

    return unsubscribe
  }, [])

  return {
    alerts,
    addAlert: (alert: any) => fleetSignals.addAlert(alert),
    acknowledgeAlert: (id: string) => fleetSignals.acknowledgeAlert(id),
    removeAlert: (id: string) => fleetSignals.removeAlert(id),
  }
}
