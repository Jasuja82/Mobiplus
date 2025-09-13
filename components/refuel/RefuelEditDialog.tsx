"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { RefuelRecord, Vehicle, Driver } from "@/types/database"

interface RefuelEditDialogProps {
  record: RefuelRecord & {
    vehicle?: { license_plate: string; make: string; model: string } | null
    driver?: { license_number: string; user?: { name: string } | null } | null
  }
  vehicles: Vehicle[]
  drivers: Driver[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RefuelEditDialog({ record, vehicles, drivers, open, onOpenChange, onSuccess }: RefuelEditDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    vehicle_id: record.vehicle_id,
    driver_id: record.driver_id,
    refuel_date: record.refuel_date.split("T")[0], // Format for date input
    mileage: record.mileage,
    liters: record.liters,
    cost_per_liter: record.cost_per_liter,
    total_cost: record.total_cost,
    fuel_station: record.fuel_station || "",
    receipt_number: record.receipt_number || "",
    notes: record.notes || "",
  })

  useEffect(() => {
    const total = formData.liters * formData.cost_per_liter
    setFormData((prev) => ({ ...prev, total_cost: Number(total.toFixed(2)) }))
  }, [formData.liters, formData.cost_per_liter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/refuel-records/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update refuel record")
      }

      toast({
        title: "Sucesso",
        description: "Registo de abastecimento atualizado com sucesso",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error updating refuel record:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar registo de abastecimento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Abastecimento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Veículo</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, vehicle_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">Condutor</Label>
              <Select
                value={formData.driver_id || ""}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, driver_id: value || null }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar condutor" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.license_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.refuel_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, refuel_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Quilometragem</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData((prev) => ({ ...prev, mileage: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liters">Litros</Label>
              <Input
                id="liters"
                type="number"
                step="0.01"
                value={formData.liters}
                onChange={(e) => setFormData((prev) => ({ ...prev, liters: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_liter">€/Litro</Label>
              <Input
                id="cost_per_liter"
                type="number"
                step="0.001"
                value={formData.cost_per_liter}
                onChange={(e) => setFormData((prev) => ({ ...prev, cost_per_liter: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_cost">Custo Total</Label>
              <Input
                id="total_cost"
                type="number"
                step="0.01"
                value={formData.total_cost}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel_station">Posto de Combustível</Label>
              <Input
                id="fuel_station"
                value={formData.fuel_station}
                onChange={(e) => setFormData((prev) => ({ ...prev, fuel_station: e.target.value }))}
                placeholder="Nome do posto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_number">Número do Recibo</Label>
              <Input
                id="receipt_number"
                value={formData.receipt_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, receipt_number: e.target.value }))}
                placeholder="Número do recibo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "A guardar..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
