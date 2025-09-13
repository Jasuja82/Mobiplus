"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, AlertTriangle, Fuel, Wrench, Database, Check, X, Filter } from "lucide-react"
import { fleetSignals, type AlertSignal } from "@/lib/signals"

export function AlertCenter() {
  const [alerts, setAlerts] = useState<AlertSignal[]>([])
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    const unsubscribe = fleetSignals.subscribeToAlerts((newAlerts) => {
      setAlerts(newAlerts)
    })

    // Simulate some initial alerts
    setTimeout(() => {
      fleetSignals.addAlert({
        type: "maintenance",
        severity: "high",
        message: "Vehicle VH001 is overdue for scheduled maintenance",
        vehicleId: "VH001",
        data: { daysOverdue: 5, maintenanceType: "Oil Change" },
      })

      fleetSignals.addAlert({
        type: "fuel",
        severity: "medium",
        message: "Unusual fuel consumption detected for Vehicle VH002",
        vehicleId: "VH002",
        data: { efficiency: 12.5, avgEfficiency: 7.2 },
      })

      fleetSignals.addAlert({
        type: "odometer",
        severity: "low",
        message: "Large odometer jump detected for Vehicle VH003",
        vehicleId: "VH003",
        data: { jump: 3500, lastReading: 45000 },
      })
    }, 1000)

    return unsubscribe
  }, [])

  const handleAcknowledge = (alertId: string) => {
    fleetSignals.acknowledgeAlert(alertId)
  }

  const handleDismiss = (alertId: string) => {
    fleetSignals.removeAlert(alertId)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "fuel":
        return <Fuel className="h-4 w-4" />
      case "system":
        return <Database className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((alert) => (filter === "unacknowledged" ? !alert.acknowledged : alert.type === filter))

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Center
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedCount}
              </Badge>
            )}
          </CardTitle>

          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unacknowledged">Unread</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="fuel">Fuel</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg space-y-3 ${alert.acknowledged ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <Badge variant={getSeverityColor(alert.severity) as any}>{alert.severity}</Badge>
                      {alert.vehicleId && <Badge variant="outline">{alert.vehicleId}</Badge>}
                    </div>

                    <div className="flex items-center gap-1">
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDismiss(alert.id)} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">{alert.timestamp.toLocaleString()}</p>
                  </div>

                  {alert.data && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      <pre>{JSON.stringify(alert.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No alerts found</div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
