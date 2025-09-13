"use client"

import { useState } from "react"
import type { RefuelRecord } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Eye, Trash2, Search, Download } from "lucide-react"
import { RefuelEditDialog } from "./RefuelEditDialog"
import { RefuelExportDialog } from "./RefuelExportDialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type RefuelRecordWithRelations = RefuelRecord & {
  vehicle?: {
    license_plate: string
    make: string
    model: string
  } | null
  driver?: {
    license_number: string
    user?: {
      name: string
    } | null
  } | null
  created_by_user?: {
    name: string
  } | null
}

interface RefuelTableProps {
  refuelRecords: RefuelRecordWithRelations[]
  vehicles?: any[]
  drivers?: any[]
  onRefresh?: () => void
}

export function RefuelTable({ refuelRecords, vehicles = [], drivers = [], onRefresh }: RefuelTableProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRecord, setEditingRecord] = useState<RefuelRecordWithRelations | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<RefuelRecordWithRelations | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const filteredRecords = refuelRecords.filter(
    (record) =>
      record.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.driver?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fuel_station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleDelete = async () => {
    if (!deletingRecord) return

    setLoading(true)
    try {
      const response = await fetch(`/api/refuel-records/${deletingRecord.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete refuel record")
      }

      toast({
        title: "Sucesso",
        description: "Registo de abastecimento eliminado com sucesso",
      })

      onRefresh?.()
      setDeletingRecord(null)
    } catch (error) {
      console.error("[v0] Error deleting refuel record:", error)
      toast({
        title: "Erro",
        description: "Erro ao eliminar registo de abastecimento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registos de Abastecimento</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar registos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={() => setExportDialogOpen(true)} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Condutor</TableHead>
                  <TableHead>Quilometragem</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>€/Litro</TableHead>
                  <TableHead>Custo Total</TableHead>
                  <TableHead>Posto</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Nenhum registo encontrado para a pesquisa." : "Nenhum abastecimento encontrado."}
                      {!searchTerm && (
                        <Link href="/refuel/new" className="text-primary hover:underline ml-1">
                          Registar o primeiro abastecimento
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{formatDate(record.refuel_date)}</TableCell>
                      <TableCell>
                        {record.vehicle ? (
                          <div>
                            <div className="font-medium">{record.vehicle.license_plate}</div>
                            <div className="text-sm text-muted-foreground">
                              {record.vehicle.make} {record.vehicle.model}
                            </div>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{record.driver?.user?.name || record.driver?.license_number || "N/A"}</TableCell>
                      <TableCell>{record.mileage.toLocaleString()} km</TableCell>
                      <TableCell>{record.liters.toFixed(1)}L</TableCell>
                      <TableCell>€{record.cost_per_liter.toFixed(3)}</TableCell>
                      <TableCell className="font-medium">€{record.total_cost.toFixed(2)}</TableCell>
                      <TableCell>{record.fuel_station || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/refuel/${record.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => setEditingRecord(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeletingRecord(record)}
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingRecord && (
        <RefuelEditDialog
          record={editingRecord}
          vehicles={vehicles}
          drivers={drivers}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
          onSuccess={() => {
            onRefresh?.()
            setEditingRecord(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRecord} onOpenChange={(open) => !open && setDeletingRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende eliminar este registo de abastecimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "A eliminar..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Advanced Export Dialog */}
      <RefuelExportDialog
        vehicles={vehicles}
        drivers={drivers}
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </>
  )
}
