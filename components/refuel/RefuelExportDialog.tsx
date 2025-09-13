"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface RefuelExportDialogProps {
  vehicles: any[]
  drivers: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RefuelExportDialog({ vehicles, drivers, open, onOpenChange }: RefuelExportDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    vehicleId: "all", // Updated default value
    driverId: "all", // Updated default value
  })

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (filters.dateFrom) {
        params.append("date_from", filters.dateFrom.toISOString().split("T")[0])
      }
      if (filters.dateTo) {
        params.append("date_to", filters.dateTo.toISOString().split("T")[0])
      }
      if (filters.vehicleId !== "all") {
        params.append("vehicle_id", filters.vehicleId)
      }
      if (filters.driverId !== "all") {
        params.append("driver_id", filters.driverId)
      }

      const response = await fetch(`/api/export/refuel-records?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `abastecimentos_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Exportação concluída",
        description: "Ficheiro Excel descarregado com sucesso",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error exporting:", error)
      toast({
        title: "Erro na exportação",
        description: "Erro ao exportar dados para Excel",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar para Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy", { locale: pt }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters((prev) => ({ ...prev, dateFrom: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy", { locale: pt }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => setFilters((prev) => ({ ...prev, dateTo: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Veículo (opcional)</Label>
            <Select
              value={filters.vehicleId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, vehicleId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os veículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os veículos</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Condutor (opcional)</Label>
            <Select
              value={filters.driverId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, driverId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os condutores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os condutores</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.license_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? "A exportar..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
