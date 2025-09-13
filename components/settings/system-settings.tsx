"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Database, Server, HardDrive, Activity, AlertTriangle, RefreshCw } from "lucide-react"

export function SystemSettings() {
  const [systemInfo, setSystemInfo] = useState({
    version: "1.2.0",
    uptime: "15 days, 3 hours",
    dbSize: "245 MB",
    dbConnections: 12,
    maxConnections: 100,
    memoryUsage: 68,
    diskUsage: 45,
    backupEnabled: true,
    maintenanceMode: false,
    debugMode: false,
  })

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
    lastBackup: "2024-01-15 02:00:00",
  })

  const handleSystemToggle = (key: string, value: boolean) => {
    setSystemInfo((prev) => ({ ...prev, [key]: value }))
  }

  const handleBackupSetting = (key: string, value: any) => {
    setBackupSettings((prev) => ({ ...prev, [key]: value }))
  }

  const runSystemMaintenance = async () => {
    if (!confirm("This will temporarily disable the system. Continue?")) return

    try {
      // Simulate maintenance
      handleSystemToggle("maintenanceMode", true)
      setTimeout(() => {
        handleSystemToggle("maintenanceMode", false)
        alert("System maintenance completed successfully!")
      }, 3000)
    } catch (error) {
      console.error("Error running maintenance:", error)
    }
  }

  const createBackup = async () => {
    try {
      const response = await fetch("/api/admin/backup", {
        method: "POST",
      })

      if (response.ok) {
        setBackupSettings((prev) => ({
          ...prev,
          lastBackup: new Date().toISOString(),
        }))
        alert("Backup created successfully!")
      }
    } catch (error) {
      console.error("Error creating backup:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>System Version</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{systemInfo.version}</Badge>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Uptime</Label>
              <div className="text-sm font-medium">{systemInfo.uptime}</div>
            </div>

            <div className="space-y-2">
              <Label>Database Size</Label>
              <div className="text-sm font-medium">{systemInfo.dbSize}</div>
            </div>

            <div className="space-y-2">
              <Label>DB Connections</Label>
              <div className="text-sm font-medium">
                {systemInfo.dbConnections}/{systemInfo.maxConnections}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Memory Usage</Label>
                <span className="text-sm text-muted-foreground">{systemInfo.memoryUsage}%</span>
              </div>
              <Progress value={systemInfo.memoryUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Disk Usage</Label>
                <span className="text-sm text-muted-foreground">{systemInfo.diskUsage}%</span>
              </div>
              <Progress value={systemInfo.diskUsage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Backups</Label>
              <div className="text-sm text-muted-foreground">Create daily database backups</div>
            </div>
            <Switch
              checked={backupSettings.autoBackup}
              onCheckedChange={(checked) => handleBackupSetting("autoBackup", checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Last Backup</Label>
              <div className="text-sm font-medium">{backupSettings.lastBackup}</div>
            </div>

            <div className="space-y-2">
              <Label>Retention Period</Label>
              <div className="text-sm font-medium">{backupSettings.retentionDays} days</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={createBackup} variant="outline">
              Create Backup Now
            </Button>
            <Button variant="outline">Restore from Backup</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <div className="text-sm text-muted-foreground">Disable system for maintenance</div>
            </div>
            <Switch
              checked={systemInfo.maintenanceMode}
              onCheckedChange={(checked) => handleSystemToggle("maintenanceMode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Debug Mode</Label>
              <div className="text-sm text-muted-foreground">Enable detailed logging</div>
            </div>
            <Switch
              checked={systemInfo.debugMode}
              onCheckedChange={(checked) => handleSystemToggle("debugMode", checked)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Button onClick={runSystemMaintenance} variant="outline" className="w-full bg-transparent">
              Run System Maintenance
            </Button>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                System maintenance will temporarily disable access for all users. Schedule during off-peak hours.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Performance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">245</div>
              <div className="text-sm text-muted-foreground">Daily Users</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
