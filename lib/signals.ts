export interface FleetSignal<T> {
  value: T
  set: (value: T) => void
  subscribe: (callback: (value: T) => void) => () => void
}

export interface AlertSignal {
  id: string
  type: "maintenance" | "fuel" | "odometer" | "system"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: Date
  vehicleId?: string
  acknowledged: boolean
  data?: any
}

class FleetSignalManager {
  private signals = new Map<string, any>()
  private subscribers = new Map<string, Set<Function>>()
  private alerts: AlertSignal[] = []
  private alertSubscribers = new Set<Function>()

  createSignal<T>(key: string, initialValue: T): FleetSignal<T> {
    if (this.signals.has(key)) {
      return this.signals.get(key)
    }

    let currentValue = initialValue
    const subscribers = new Set<Function>()

    const signal: FleetSignal<T> = {
      get value() {
        return currentValue
      },
      set: (newValue: T) => {
        if (currentValue !== newValue) {
          currentValue = newValue
          subscribers.forEach((callback) => callback(newValue))
          this.notifySubscribers(key, newValue)
        }
      },
      subscribe: (callback: (value: T) => void) => {
        subscribers.add(callback)
        return () => subscribers.delete(callback)
      },
    }

    this.signals.set(key, signal)
    this.subscribers.set(key, subscribers)
    return signal
  }

  createComputedSignal<T>(key: string, computation: () => T): FleetSignal<T> {
    const computed = this.createSignal(key, computation())

    // Re-compute when dependencies change
    const recompute = () => {
      try {
        const newValue = computation()
        computed.set(newValue)
      } catch (error) {
        console.error(`Error computing signal ${key}:`, error)
      }
    }

    // Set up automatic recomputation (simplified)
    setInterval(recompute, 1000)

    return computed
  }

  addAlert(alert: Omit<AlertSignal, "id" | "timestamp" | "acknowledged">): string {
    const newAlert: AlertSignal = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
    }

    this.alerts.unshift(newAlert)
    this.alertSubscribers.forEach((callback) => callback(this.alerts))

    // Auto-remove low severity alerts after 5 minutes
    if (alert.severity === "low") {
      setTimeout(
        () => {
          this.removeAlert(newAlert.id)
        },
        5 * 60 * 1000,
      )
    }

    return newAlert.id
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      this.alertSubscribers.forEach((callback) => callback(this.alerts))
    }
  }

  removeAlert(alertId: string): void {
    const index = this.alerts.findIndex((a) => a.id === alertId)
    if (index !== -1) {
      this.alerts.splice(index, 1)
      this.alertSubscribers.forEach((callback) => callback(this.alerts))
    }
  }

  subscribeToAlerts(callback: (alerts: AlertSignal[]) => void): () => void {
    this.alertSubscribers.add(callback)
    callback(this.alerts) // Initial call
    return () => this.alertSubscribers.delete(callback)
  }

  getAlerts(filter?: { type?: string; severity?: string; acknowledged?: boolean }): AlertSignal[] {
    let filtered = [...this.alerts]

    if (filter?.type) {
      filtered = filtered.filter((a) => a.type === filter.type)
    }
    if (filter?.severity) {
      filtered = filtered.filter((a) => a.severity === filter.severity)
    }
    if (filter?.acknowledged !== undefined) {
      filtered = filtered.filter((a) => a.acknowledged === filter.acknowledged)
    }

    return filtered
  }

  private notifySubscribers(key: string, value: any): void {
    const subscribers = this.subscribers.get(key)
    if (subscribers) {
      subscribers.forEach((callback) => callback(value))
    }
  }
}

export const fleetSignals = new FleetSignalManager()

export const createFleetSignals = () => {
  // Vehicle statistics
  const totalVehicles = fleetSignals.createSignal("totalVehicles", 0)
  const activeVehicles = fleetSignals.createSignal("activeVehicles", 0)
  const maintenanceVehicles = fleetSignals.createSignal("maintenanceVehicles", 0)

  // Fuel efficiency
  const avgFuelEfficiency = fleetSignals.createComputedSignal("avgFuelEfficiency", () => {
    // This would calculate from actual data
    return 7.2 // L/100km
  })

  // Maintenance alerts
  const pendingMaintenance = fleetSignals.createComputedSignal("pendingMaintenance", () => {
    // Calculate vehicles due for maintenance
    return 3
  })

  // Cost tracking
  const monthlyFuelCost = fleetSignals.createSignal("monthlyFuelCost", 0)
  const monthlyMaintenanceCost = fleetSignals.createSignal("monthlyMaintenanceCost", 0)

  return {
    totalVehicles,
    activeVehicles,
    maintenanceVehicles,
    avgFuelEfficiency,
    pendingMaintenance,
    monthlyFuelCost,
    monthlyMaintenanceCost,
  }
}
