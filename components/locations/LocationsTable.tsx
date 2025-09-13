"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, MapPin, Eye } from "lucide-react"
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

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.region?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar localizações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
                  {searchTerm ? "Nenhuma localização encontrada" : "Nenhuma localização encontrada"}
                  {!searchTerm && (
                    <Link href="/locations/new" className="text-primary hover:underline ml-1">
                      Adicione a primeira localização
                    </Link>
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
