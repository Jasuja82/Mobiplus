"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PermissionGuard } from "@/components/common/permission-guard"
import { Car, Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { useAuth } from "@/hooks/use-auth.tsx"

interface Vehicle {
  id: string
  license_plate: string
  make: string
  model: string
  year: number
  status: string
  department_name: string
  odometer: number
}

export function VehicleCrudTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles")
      const data = await response.json()
      setVehicles(data.vehicles || [])
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error)
    }
  }

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Fleet Vehicles
          </CardTitle>

          <PermissionGuard resource="vehicles" action="create">
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </PermissionGuard>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Plate</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                <TableCell>
                  {vehicle.make} {vehicle.model}
                </TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>
                  <Badge variant={vehicle.status === "active" ? "default" : "secondary"}>{vehicle.status}</Badge>
                </TableCell>
                <TableCell>{vehicle.department_name}</TableCell>
                <TableCell>{vehicle.odometer?.toLocaleString()} km</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <PermissionGuard resource="vehicles" action="read">
                        <DropdownMenuItem onClick={() => setSelectedVehicle(vehicle)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </PermissionGuard>

                      <PermissionGuard resource="vehicles" action="update">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedVehicle(vehicle)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </PermissionGuard>

                      <PermissionGuard resource="vehicles" action="delete">
                        <DropdownMenuItem onClick={() => handleDelete(vehicle.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </PermissionGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredVehicles.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">No vehicles found</div>
        )}
      </CardContent>
    </Card>
  )
}
