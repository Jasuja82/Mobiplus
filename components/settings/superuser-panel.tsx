"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Shield,
  Database,
  UserPlus,
  Key,
  Activity,
  AlertTriangle,
  Play,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react"

export function SuperuserPanel() {
  const [activeTab, setActiveTab] = useState("users")
  const [systemStats, setSystemStats] = useState<any>({})
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStats()
    fetchAuditLogs()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const response = await fetch("/api/admin/system-stats")
      if (response.ok) {
        const data = await response.json()
        setSystemStats(data)
        console.log("[v0] System stats loaded:", data)
      }
    } catch (error) {
      console.error("Error fetching system stats:", error)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("/api/admin/audit-logs")
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs || [])
        console.log("[v0] Audit logs loaded:", data.logs?.length, "entries")
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <div className="text-2xl font-bold">{systemStats.dbSize || "Loading..."}</div>
            <div className="text-xs text-muted-foreground">Storage used</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold">{systemStats.activeUsers || "0"}</div>
            <div className="text-xs text-muted-foreground">Currently active</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Total Records</span>
            </div>
            <div className="text-2xl font-bold">{systemStats.totalRefuelRecords || "0"}</div>
            <div className="text-xs text-muted-foreground">Refuel records</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Vehicles</span>
            </div>
            <div className="text-2xl font-bold">{systemStats.totalVehicles || "0"}</div>
            <div className="text-xs text-muted-foreground">In fleet</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="user@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="fleet_manager">Fleet Manager</SelectItem>
                  <SelectItem value="maintenance_tech">Maintenance Tech</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">Create User</Button>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>A temporary password will be generated and sent to the user's email.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Backup DB
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                Restore DB
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sql-query">Execute SQL Query</Label>
              <Textarea id="sql-query" placeholder="SELECT * FROM vehicles WHERE status = 'active'" rows={4} />
            </div>

            <Button variant="destructive" className="w-full flex items-center gap-2">
              <Play className="h-4 w-4" />
              Execute Query
            </Button>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Direct SQL execution can affect system integrity. Use with caution.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Module Access Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { module: "Fleet Management", roles: ["admin", "fleet_manager"], status: "active" },
                { module: "Maintenance", roles: ["admin", "maintenance_tech"], status: "active" },
                { module: "Analytics", roles: ["admin", "fleet_manager", "viewer"], status: "active" },
                { module: "Import/Export", roles: ["admin", "fleet_manager"], status: "active" },
                { module: "User Management", roles: ["admin"], status: "restricted" },
              ].map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.module}</span>
                    <Badge variant={item.status === "active" ? "default" : "destructive"}>{item.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.roles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Audit Logs
            <Button variant="ghost" size="sm" onClick={fetchAuditLogs} disabled={loading}>
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Admin Users</SelectItem>
                  <SelectItem value="manager">Fleet Managers</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">Export Logs</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.slice(0, 10).map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.ip_address}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
