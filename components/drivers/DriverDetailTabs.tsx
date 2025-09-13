"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Car, FileText, Fuel, Calendar, Phone, Mail, Building } from "lucide-react"
import type { DriverWithRelations } from "@/types/database"

interface DriverDetailTabsProps {
  driver: DriverWithRelations
  currentAssignments: any[]
  assignmentHistory: any[]
  refuelRecords: any[]
}

export function DriverDetailTabs({
  driver,
  currentAssignments,
  assignmentHistory,
  refuelRecords,
}: DriverDetailTabsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT")
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-PT")
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  }

  return (
    <Tabs defaultValue="details" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Detalhes básicos
        </TabsTrigger>
        <TabsTrigger value="assignments" className="flex items-center gap-2">
          <Car className="h-4 w-4" />
          Atribuições
        </TabsTrigger>
        <TabsTrigger value="refuels" className="flex items-center gap-2">
          <Fuel className="h-4 w-4" />
          Abastecimentos
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documentos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium">{driver.user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div>
                    <Badge variant={driver.is_active ? "default" : "secondary"}>
                      {driver.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.user?.email}</span>
                </div>
                {driver.user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{driver.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.department?.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* License Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações da Carta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número da Carta</label>
                <p className="font-mono font-medium">{driver.license_number}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Categorias</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {driver.license_categories?.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Validade da Carta</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={isExpiringSoon(driver.license_expiry) ? "text-red-600 font-medium" : ""}>
                      {formatDate(driver.license_expiry)}
                    </span>
                    {isExpiringSoon(driver.license_expiry) && (
                      <Badge variant="destructive" className="text-xs">
                        Expira em breve
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Certificado Médico</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={isExpiringSoon(driver.medical_certificate_expiry) ? "text-red-600 font-medium" : ""}
                    >
                      {formatDate(driver.medical_certificate_expiry)}
                    </span>
                    {isExpiringSoon(driver.medical_certificate_expiry) && (
                      <Badge variant="destructive" className="text-xs">
                        Expira em breve
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {driver.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{driver.notes}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="assignments" className="space-y-6">
        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Atribuições Atuais</CardTitle>
          </CardHeader>
          <CardContent>
            {currentAssignments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhuma atribuição ativa encontrada</p>
            ) : (
              <div className="space-y-4">
                {currentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {assignment.vehicle.license_plate} - {assignment.vehicle.make} {assignment.vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Atribuído em {formatDate(assignment.assigned_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Atribuições</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentHistory.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum histórico de atribuições encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Atribuído em</TableHead>
                    <TableHead>Desatribuído em</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignmentHistory.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assignment.vehicle.license_plate}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.vehicle.make} {assignment.vehicle.model}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(assignment.assigned_at)}</TableCell>
                      <TableCell>{assignment.unassigned_at ? formatDate(assignment.unassigned_at) : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.is_active ? "default" : "secondary"}>
                          {assignment.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="refuels" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Abastecimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {refuelRecords.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum abastecimento encontrado para este condutor
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Litros</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>€/Litro</TableHead>
                    <TableHead>Quilometragem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refuelRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.refuel_date)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.vehicle.license_plate}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.vehicle.make} {record.vehicle.model}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{record.liters?.toFixed(2)} L</TableCell>
                      <TableCell>€{record.total_cost?.toFixed(2)}</TableCell>
                      <TableCell>€{record.cost_per_liter?.toFixed(3)}</TableCell>
                      <TableCell>{record.odometer_reading?.toLocaleString()} km</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">Funcionalidade de documentos em desenvolvimento</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
