"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, MapPin, Eye, Filter } from "lucide-react"
import Link from "next/link"

interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  region: string | null
  country: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LocationsTableProps {
  locations: Location[]
}

export function LocationsTable({ locations }: LocationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [cityFilter, setCityFilter] = useState<string>("all")

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch =
        !searchTerm.trim() ||
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.region?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && location.is_active) ||
        (statusFilter === "inactive" && !location.is_active)

      const matchesRegion = regionFilter === "all" || location.region === regionFilter
      const matchesCity = cityFilter === "all" || location.city === cityFilter

      return matchesSearch && matchesStatus && matchesRegion && matchesCity
    })
  }, [locations, searchTerm, statusFilter, regionFilter, cityFilter])

  const uniqueRegions = useMemo(() => {
    return [...new Set(locations.map((l) => l.region).filter(Boolean))].sort()
  }, [locations])

  const uniqueCities = useMemo(() => {
    return [...new Set(locations.map((l) => l.city).filter(Boolean))].sort()
  }, [locations])

  const handleDelete = async (locationId: string, locationName: string) => {
    if (!confirm(`Tem certeza que deseja eliminar a localização "${locationName}"?`)) return

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        alert("Erro ao eliminar localização: " + (result.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Error deleting location:", error)
      alert("Erro ao eliminar localização")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar localizações..."
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
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredLocations.length} de {locations.length} localizações
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Região</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {locations.length === 0 ? (
                    <>
                      Nenhuma localização encontrada.{" "}
                      <Link href="/locations/new" className="text-primary hover:underline">
                        Adicione a primeira localização
                      </Link>
                    </>
                  ) : (
                    "Nenhuma localização corresponde aos filtros aplicados."
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {location.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{location.address || "N/A"}</TableCell>
                  <TableCell>{location.city || "N/A"}</TableCell>
                  <TableCell>{location.region || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={location.is_active ? "default" : "secondary"}>
                      {location.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(location.created_at).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/locations/${location.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/locations/${location.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(location.id, location.name)}
                      >
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
    </div>
  )
}
