"use client"

import type React from "react"

import { useMemo, useState } from "react"
import type { VehicleWithRelations } from "@/types/relations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Eye, Trash2, Search, Filter, ChevronUp, ChevronDown } from "lucide-react"
import Link from "next/link"

interface VehiclesTableProps {
  vehicles: (VehicleWithRelations & { latest_odometer?: number })[]
}

type SortField =
  | "vehicle_number"
  | "make_model"
  | "registration_date"
  | "age"
  | "category"
  | "department"
  | "fuel_type"
  | "status"
  | "mileage"
type SortDirection = "asc" | "desc" | null

const statusColors = {
  active: "bg-green-100 text-green-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  inactive: "bg-gray-100 text-gray-800",
  retired: "bg-red-100 text-red-800",
}

const statusLabels = {
  active: "Ativo",
  maintenance: "Manutenção",
  inactive: "Inativo",
  retired: "Retirado",
}

const fuelTypeLabels = {
  gasoline: "Gasolina",
  diesel: "Diesel",
  electric: "Elétrico",
  hybrid: "Híbrido",
}

export function VehiclesTable({ vehicles }: VehiclesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [fuelFilter, setFuelFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        <div className="flex flex-col">
          <ChevronUp
            className={`h-3 w-3 ${
              sortField === field && sortDirection === "asc" ? "text-primary" : "text-muted-foreground/40"
            }`}
          />
          <ChevronDown
            className={`h-3 w-3 -mt-1 ${
              sortField === field && sortDirection === "desc" ? "text-primary" : "text-muted-foreground/40"
            }`}
          />
        </div>
      </div>
    </TableHead>
  )

  const filteredVehicles = useMemo(() => {
    const filtered = vehicles.filter((vehicle) => {
      const matchesSearch =
        searchTerm === "" ||
        vehicle.internal_number?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        vehicle.vehicle_number?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        vehicle.license_plate?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.department?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
      const matchesFuel = fuelFilter === "all" || vehicle.fuel_type === fuelFilter
      const matchesDepartment = departmentFilter === "all" || vehicle.department?.id === departmentFilter

      return matchesSearch && matchesStatus && matchesFuel && matchesDepartment
    })

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortField) {
          case "vehicle_number":
            aValue = a.vehicle_number || a.internal_number || ""
            bValue = b.vehicle_number || b.internal_number || ""
            break
          case "make_model":
            aValue = `${a.make} ${a.model}`
            bValue = `${b.make} ${b.model}`
            break
          case "registration_date":
            aValue = a.registration_date ? new Date(a.registration_date) : new Date(0)
            bValue = b.registration_date ? new Date(b.registration_date) : new Date(0)
            break
          case "age":
            aValue = a.age_years || 0
            bValue = b.age_years || 0
            break
          case "category":
            aValue = a.category?.name || ""
            bValue = b.category?.name || ""
            break
          case "department":
            aValue = a.department?.name || ""
            bValue = b.department?.name || ""
            break
          case "fuel_type":
            aValue = fuelTypeLabels[a.fuel_type] || ""
            bValue = fuelTypeLabels[b.fuel_type] || ""
            break
          case "status":
            aValue = statusLabels[a.status] || ""
            bValue = statusLabels[b.status] || ""
            break
          case "mileage":
            aValue = a.latest_odometer || a.current_mileage || 0
            bValue = b.latest_odometer || b.current_mileage || 0
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [vehicles, searchTerm, statusFilter, fuelFilter, departmentFilter, sortField, sortDirection])

  const uniqueDepartments = useMemo(() => {
    const departments = vehicles
      .map((v) => v.department)
      .filter((dept, index, self) => dept && self.findIndex((d) => d?.id === dept.id) === index)
    return departments
  }, [vehicles])

  const formatRegistrationInfo = useMemo(() => {
    return (vehicle: VehicleWithRelations & { latest_odometer?: number }) => {
      if (vehicle.registration_date) {
        try {
          const regDate = new Date(vehicle.registration_date)
          const age = vehicle.age_years
          return {
            date: regDate.toLocaleDateString("pt-PT"),
            age: age ? `${age} anos` : "N/A",
          }
        } catch {
          return {
            date: vehicle.year ? `${vehicle.year}` : "N/A",
            age: "N/A",
          }
        }
      }
      return {
        date: vehicle.year ? `${vehicle.year}` : "N/A",
        age: "N/A",
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Veículos</CardTitle>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nº, matrícula, marca/modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="retired">Retirado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fuelFilter} onValueChange={setFuelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Combustível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="gasoline">Gasolina</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Elétrico</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept!.id} value={dept!.id}>
                    {dept!.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredVehicles.length} de {vehicles.length} veículos
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="vehicle_number">Nº Viatura / Matrícula</SortableHeader>
                <SortableHeader field="make_model">Marca/Modelo</SortableHeader>
                <SortableHeader field="registration_date">Data de Matrícula</SortableHeader>
                <SortableHeader field="age">Idade</SortableHeader>
                <SortableHeader field="category">Categoria</SortableHeader>
                <SortableHeader field="department">Departamento</SortableHeader>
                <SortableHeader field="fuel_type">Combustível</SortableHeader>
                <SortableHeader field="status">Estado</SortableHeader>
                <SortableHeader field="mileage">Quilometragem</SortableHeader>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {vehicles.length === 0 ? (
                      <>
                        Nenhum veículo encontrado.{" "}
                        <Link href="/vehicles/new" className="text-primary hover:underline">
                          Adicione o primeiro veículo
                        </Link>
                      </>
                    ) : (
                      "Nenhum veículo corresponde aos filtros aplicados."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const regInfo = formatRegistrationInfo(vehicle)
                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">
                            {vehicle.vehicle_number || vehicle.internal_number || "N/A"}
                          </span>
                          <span className="text-sm text-muted-foreground">{vehicle.license_plate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell>{regInfo.date}</TableCell>
                      <TableCell>{regInfo.age}</TableCell>
                      <TableCell>{vehicle.category?.name || "N/A"}</TableCell>
                      <TableCell>{vehicle.department?.name || "N/A"}</TableCell>
                      <TableCell>{fuelTypeLabels[vehicle.fuel_type]}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[vehicle.status]}>{statusLabels[vehicle.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        {(vehicle.latest_odometer || vehicle.current_mileage || 0).toLocaleString()} km
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/vehicles/${vehicle.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/vehicles/${vehicle.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
