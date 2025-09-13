"use client"

import type { VehicleWithRelations } from "@/types/database"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

interface VehiclesTableProps {
  vehicles: VehicleWithRelations[]
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Veículos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Combustível</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Quilometragem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum veículo encontrado.
                    <Link href="/vehicles/new" className="text-primary hover:underline ml-1">
                      Adicione o primeiro veículo
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                    <TableCell>
                      {vehicle.make} {vehicle.model}
                    </TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.category?.name || "N/A"}</TableCell>
                    <TableCell>{vehicle.department?.name || "N/A"}</TableCell>
                    <TableCell>{fuelTypeLabels[vehicle.fuel_type]}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[vehicle.status]}>{statusLabels[vehicle.status]}</Badge>
                    </TableCell>
                    <TableCell>{vehicle.current_mileage.toLocaleString()} km</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
