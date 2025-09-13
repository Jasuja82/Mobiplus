"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bell, AlertTriangle, Fuel, Wrench } from "lucide-react"

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    maintenanceAlerts: true,
    fuelAlerts: true,
    odometerAlerts: true,
    maintenanceThreshold: 30,
    fuelEfficiencyThreshold: 20,
    odometerJumpThreshold: 3000,
    notificationEmail: "admin@mobiazores.com",
  })

  const handleNotificationChange = (key: string, value: any) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const saveNotifications = async () => {
    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      })

      if (response.ok) {
        alert("Notification settings saved successfully!")
      }
    } catch (error) {
      console.error("Error saving notification settings:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            General Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <div className="text-sm text-muted-foreground">Receive alerts via email</div>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <div className="text-sm text-muted-foreground">Browser push notifications</div>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input
              id="notification-email"
              type="email"
              value={notifications.notificationEmail}
              onChange={(e) => handleNotificationChange("notificationEmail", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Fleet Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <div className="space-y-0.5">
                  <Label>Maintenance Alerts</Label>
                  <div className="text-sm text-muted-foreground">Alert when maintenance is due</div>
                </div>
              </div>
              <Switch
                checked={notifications.maintenanceAlerts}
                onCheckedChange={(checked) => handleNotificationChange("maintenanceAlerts", checked)}
              />
            </div>

            {notifications.maintenanceAlerts && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="maintenance-threshold">Alert threshold (days before due)</Label>
                <Select
                  value={notifications.maintenanceThreshold.toString()}
                  onValueChange={(value) => handleNotificationChange("maintenanceThreshold", Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                <div className="space-y-0.5">
                  <Label>Fuel Efficiency Alerts</Label>
                  <div className="text-sm text-muted-foreground">Alert on unusual fuel consumption</div>
                </div>
              </div>
              <Switch
                checked={notifications.fuelAlerts}
                onCheckedChange={(checked) => handleNotificationChange("fuelAlerts", checked)}
              />
            </div>

            {notifications.fuelAlerts && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="fuel-threshold">Efficiency variance threshold (%)</Label>
                <Select
                  value={notifications.fuelEfficiencyThreshold.toString()}
                  onValueChange={(value) => handleNotificationChange("fuelEfficiencyThreshold", Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Odometer Jump Alerts</Label>
                <div className="text-sm text-muted-foreground">Alert on large odometer increases</div>
              </div>
              <Switch
                checked={notifications.odometerAlerts}
                onCheckedChange={(checked) => handleNotificationChange("odometerAlerts", checked)}
              />
            </div>

            {notifications.odometerAlerts && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="odometer-threshold">Odometer jump threshold (km)</Label>
                <Select
                  value={notifications.odometerJumpThreshold.toString()}
                  onValueChange={(value) => handleNotificationChange("odometerJumpThreshold", Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1,000 km</SelectItem>
                    <SelectItem value="3000">3,000 km</SelectItem>
                    <SelectItem value="5000">5,000 km</SelectItem>
                    <SelectItem value="10000">10,000 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveNotifications} className="bg-blue-600 hover:bg-blue-700">
          Save Notification Settings
        </Button>
      </div>
    </div>
  )
}
