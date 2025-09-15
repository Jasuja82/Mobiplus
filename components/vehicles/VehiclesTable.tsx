"use client"

import { useMemo, useState } from "react"
import type { VehicleWithRelations } from "@/types/relations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Eye, Trash2, Search, Filter } from "lucide-react"
import Link from "next/link"

interface VehiclesTableProps {
  vehicles: (VehicleWithRelations & { latest_odometer?: number })[]
}

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

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        searchTerm === "" ||
        vehicle.internal_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
      const matchesFuel = fuelFilter === "all" || vehicle.fuel_type === fuelFilter
      const matchesDepartment = departmentFilter === "all" || vehicle.department?.id === departmentFilter

      return matchesSearch && matchesStatus && matchesFuel && matchesDepartment
    })
  }, [vehicles, searchTerm, statusFilter, fuelFilter, departmentFilter])

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
                <TableHead>Nº Viatura / Matrícula</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Data de Matrícula</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Combustível</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Quilometragem</TableHead>
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
