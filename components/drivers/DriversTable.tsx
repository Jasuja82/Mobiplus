"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Eye, Edit, Trash2, Filter } from "lucide-react"
import Link from "next/link"
import type { DriverWithRelations } from "@/types/relations"

interface DriversTableProps {
  drivers: DriverWithRelations[]
}

export function DriversTable({ drivers }: DriversTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [licenseExpiryFilter, setLicenseExpiryFilter] = useState<string>("all")

  console.log("[v0] DriversTable received drivers:", drivers)
  console.log("[v0] Drivers array length:", drivers?.length || 0)

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch =
        !searchTerm.trim() ||
        driver.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        driver.internal_number?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        driver.license_number?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        driver.department?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        driver.user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        driver.user?.email?.toLowerCase()?.includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && driver.is_active) ||
        (statusFilter === "inactive" && !driver.is_active)

      const matchesDepartment = departmentFilter === "all" || driver.department?.id === departmentFilter

      const matchesLicenseExpiry =
        licenseExpiryFilter === "all" ||
        (licenseExpiryFilter === "expiring" && isLicenseExpiringSoon(driver.license_expiry)) ||
        (licenseExpiryFilter === "valid" && driver.license_expiry && !isLicenseExpiringSoon(driver.license_expiry)) ||
        (licenseExpiryFilter === "missing" && !driver.license_expiry)

      return matchesSearch && matchesStatus && matchesDepartment && matchesLicenseExpiry
    })
  }, [drivers, searchTerm, statusFilter, departmentFilter, licenseExpiryFilter])

  const uniqueDepartments = useMemo(() => {
    const departments = drivers
      .map((d) => d.department)
      .filter((dept, index, self) => dept && self.findIndex((d) => d?.id === dept.id) === index)
    return departments
  }, [drivers])

  console.log("[v0] Filtered drivers count:", filteredDrivers.length)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar condutores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
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
              <SelectItem value="inactive">Inativo</SelectItem>
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
          <Select value={licenseExpiryFilter} onValueChange={setLicenseExpiryFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Carta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="valid">Válidas</SelectItem>
              <SelectItem value="expiring">A expirar</SelectItem>
              <SelectItem value="missing">Sem carta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredDrivers.length} de {drivers?.length || 0} condutores
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Nº Interno</TableHead>
              <TableHead>Nº Carta</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>Validade Carta</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {drivers?.length === 0 ? (
                    <>
                      Nenhum condutor registado.{" "}
                      <Link href="/drivers/new" className="text-primary hover:underline">
                        Adicione o primeiro condutor
                      </Link>
                    </>
                  ) : (
                    "Nenhum condutor corresponde aos filtros aplicados."
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{driver.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {driver.user?.email || "Sem utilizador associado"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{driver.internal_number}</TableCell>
                  <TableCell className="font-mono">{driver.license_number || "—"}</TableCell>
                  <TableCell>
                    {driver.license_categories && driver.license_categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {driver.license_categories.map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {driver.license_expiry ? (
                      <div className={isLicenseExpiringSoon(driver.license_expiry) ? "text-red-600" : ""}>
                        {formatDate(driver.license_expiry)}
                        {isLicenseExpiringSoon(driver.license_expiry) && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Expira em breve
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </TableCell>
                  <TableCell>{driver.department?.name || "Sem departamento"}</TableCell>
                  <TableCell>
                    <Badge variant={driver.is_active ? "default" : "secondary"}>
                      {driver.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/drivers/${driver.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/drivers/${driver.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleDateString("pt-PT")
  } catch {
    return "—"
  }
}

function isLicenseExpiringSoon(expiryDate: string | null) {
  if (!expiryDate) return false
  try {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  } catch {
    return false
  }
}
