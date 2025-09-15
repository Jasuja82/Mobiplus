"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Car, BarChart3, MapPin, Building, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import type { AssignmentType } from "@/types/entities/AssignmentType"
import type { VehicleWithRelations } from "@/types/relations"

interface AssignmentDetailTabsProps {
  assignment: AssignmentType
  vehicles: VehicleWithRelations[]
}

export function AssignmentDetailTabs({ assignment, vehicles }: AssignmentDetailTabsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Ativo</Badge>
      case "maintenance":
        return <Badge variant="secondary">Manutenção</Badge>
      case "inactive":
        return <Badge variant="outline">Inativo</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate statistics
  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter((v) => v.status === "active").length
  const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length
  const inactiveVehicles = vehicles.filter((v) => v.status === "inactive").length

  // Group vehicles by department
  const vehiclesByDepartment = vehicles.reduce(
    (acc, vehicle) => {
      const deptName = vehicle.department?.name || "Sem departamento"
      if (!acc[deptName]) {
        acc[deptName] = []
      }
      acc[deptName].push(vehicle)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <Tabs defaultValue="details" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Detalhes básicos
        </TabsTrigger>
        <TabsTrigger value="vehicles" className="flex items-center gap-2">
          <Car className="h-4 w-4" />
          Veículos
        </TabsTrigger>
        <TabsTrigger value="statistics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Estatísticas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="font-medium text-lg">{assignment.name}</p>
              </div>

              {assignment.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="text-sm whitespace-pre-wrap">{assignment.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Criado em: </span>
                    <span className="font-medium">{formatDate(assignment.created_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumo de Utilização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{totalVehicles}</div>
                  <div className="text-sm text-muted-foreground">Total de Veículos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{activeVehicles}</div>
                  <div className="text-sm text-muted-foreground">Ativos</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{maintenanceVehicles}</div>
                  <div className="text-sm text-muted-foreground">Em Manutenção</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{inactiveVehicles}</div>
                  <div className="text-sm text-muted-foreground">Inativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="vehicles" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Veículos com esta Atribuição</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum veículo encontrado com esta atribuição</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vehicle.license_plate}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {vehicle.department?.name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.category?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {vehicle.home_location?.name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>
                        <Link href={`/vehicles/${vehicle.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="statistics" className="space-y-6">
        {/* Statistics by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(vehiclesByDepartment).length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum dado estatístico disponível</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(vehiclesByDepartment).map(([deptName, deptVehicles]) => (
                  <div key={deptName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{deptName}</p>
                        <p className="text-sm text-muted-foreground">
                          {deptVehicles.length} {deptVehicles.length === 1 ? "veículo" : "veículos"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{deptVehicles.filter((v) => v.status === "active").length} ativos</Badge>
                      {deptVehicles.filter((v) => v.status === "maintenance").length > 0 && (
                        <Badge variant="secondary">
                          {deptVehicles.filter((v) => v.status === "maintenance").length} manutenção
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{totalVehicles}</div>
                <div className="text-sm text-muted-foreground mt-1">Total de Veículos</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {totalVehicles > 0 ? `${((activeVehicles / totalVehicles) * 100).toFixed(1)}% ativos` : "0% ativos"}
                </div>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{Object.keys(vehiclesByDepartment).length}</div>
                <div className="text-sm text-muted-foreground mt-1">Departamentos</div>
                <div className="text-xs text-muted-foreground mt-2">Utilizando esta atribuição</div>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {totalVehicles > 0 ? Math.round(totalVehicles / Object.keys(vehiclesByDepartment).length) : 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Média por Dept.</div>
                <div className="text-xs text-muted-foreground mt-2">Veículos por departamento</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
