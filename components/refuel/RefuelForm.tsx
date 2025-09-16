"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calculator } from "lucide-react"
import Link from "next/link"

interface Vehicle {
  id: string
  license_plate: string
  make_id: string | null
  model_id: string | null
  current_mileage: number
  fuel_capacity: number | null
}

interface Driver {
  id: string
  name: string
  internal_number: string
}

interface RefuelFormProps {
  vehicles: Vehicle[]
  drivers: Driver[]
  currentUserId: string
  refuelRecord?: any // For edit mode
}

export function RefuelForm({ vehicles, drivers, currentUserId, refuelRecord }: RefuelFormProps) {
  const [formData, setFormData] = useState({
    vehicle_id: refuelRecord?.vehicle_id || "",
    driver_id: refuelRecord?.driver_id || "",
    refuel_date: refuelRecord?.refuel_date?.split("T")[0] || new Date().toISOString().split("T")[0],
    refuel_time: refuelRecord?.refuel_date ? new Date(refuelRecord.refuel_date).toTimeString().slice(0, 5) : "12:00",
    odometer_reading: refuelRecord?.odometer_reading || "",
    liters: refuelRecord?.liters || "",
    cost_per_liter: refuelRecord?.cost_per_liter || "",
    total_cost: refuelRecord?.total_cost || "",
    fuel_station_id: refuelRecord?.fuel_station_id || "",
    receipt_number: refuelRecord?.receipt_number || "",
    invoice_number: refuelRecord?.invoice_number || "",
    notes: refuelRecord?.notes || "",
    is_full_tank: refuelRecord?.is_full_tank ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const router = useRouter()

  // Update selected vehicle when vehicle_id changes
  useEffect(() => {
    if (formData.vehicle_id) {
      const vehicle = vehicles.find((v) => v.id === formData.vehicle_id)
      setSelectedVehicle(vehicle || null)

      // Auto-fill odometer reading if not already set
      if (vehicle && !formData.odometer_reading) {
        setFormData((prev) => ({
          ...prev,
          odometer_reading: vehicle.current_mileage.toString(),
        }))
      }
    } else {
      setSelectedVehicle(null)
    }
  }, [formData.vehicle_id, vehicles, formData.odometer_reading])

  // Calculate total cost when liters or cost per liter changes
  useEffect(() => {
    if (formData.liters && formData.cost_per_liter) {
      const total = Number(formData.liters) * Number(formData.cost_per_liter)
      setFormData((prev) => ({
        ...prev,
        total_cost: total.toFixed(2),
      }))
    }
  }, [formData.liters, formData.cost_per_liter])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const validateForm = () => {
    if (
      !formData.vehicle_id ||
      !formData.driver_id ||
      !formData.refuel_date ||
      !formData.odometer_reading ||
      !formData.liters ||
      !formData.cost_per_liter
    ) {
      setError("Por favor, preencha todos os campos obrigatórios")
      return false
    }

    if (Number(formData.liters) <= 0) {
      setError("A quantidade de litros deve ser maior que zero")
      return false
    }

    if (Number(formData.cost_per_liter) <= 0) {
      setError("O preço por litro deve ser maior que zero")
      return false
    }

    if (Number(formData.odometer_reading) < 0) {
      setError("A quilometragem não pode ser negativa")
      return false
    }

    // Check if odometer reading is reasonable compared to vehicle's current mileage
    if (selectedVehicle && Number(formData.odometer_reading) < selectedVehicle.current_mileage - 1000) {
      setError("A quilometragem parece estar muito abaixo da quilometragem atual do veículo")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Combine date and time
      const refuelDateTime = new Date(`${formData.refuel_date}T${formData.refuel_time}:00`)

      const refuelData = {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id,
        refuel_date: refuelDateTime.toISOString(),
        odometer_reading: Number(formData.odometer_reading),
        liters: Number(formData.liters),
        cost_per_liter: Number(formData.cost_per_liter),
        total_cost: Number(formData.total_cost),
        fuel_station_id: formData.fuel_station_id || null,
        receipt_number: formData.receipt_number || null,
        invoice_number: formData.invoice_number || null,
        notes: formData.notes || null,
        is_full_tank: formData.is_full_tank,
        created_by: currentUserId,
      }

      let result
      if (refuelRecord) {
        // Update existing record
        result = await supabase.from("refuel_records").update(refuelData).eq("id", refuelRecord.id)
      } else {
        // Create new record
        result = await supabase.from("refuel_records").insert(refuelData)
      }

      if (result.error) {
        throw result.error
      }

      // Update vehicle mileage if this is a newer reading
      if (selectedVehicle && Number(formData.odometer_reading) > selectedVehicle.current_mileage) {
        await supabase
          .from("vehicles")
          .update({ current_mileage: Number(formData.odometer_reading) })
          .eq("id", formData.vehicle_id)
      }

      console.log("✅ Refuel record saved successfully")
      router.push("/refuel")
    } catch (err) {
      console.error("Error saving refuel record:", err)
      setError(err instanceof Error ? err.message : "Erro ao guardar abastecimento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/refuel">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{refuelRecord ? "Editar Abastecimento" : "Dados do Abastecimento"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle */}
              <div className="grid gap-2">
                <Label htmlFor="vehicle_id">Veículo *</Label>
                <select
                  id="vehicle_id"
                  name="vehicle_id"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.vehicle_id}
                  onChange={handleInputChange}
                >
                  <option value="">Selecionar veículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate}
                    </option>
                  ))}
                </select>
                {selectedVehicle && (
                  <p className="text-xs text-muted-foreground">
                    Quilometragem atual: {selectedVehicle.current_mileage.toLocaleString()} km
                    {selectedVehicle.fuel_capacity && ` | Capacidade: ${selectedVehicle.fuel_capacity}L`}
                  </p>
                )}
              </div>

              {/* Driver */}
              <div className="grid gap-2">
                <Label htmlFor="driver_id">Condutor *</Label>
                <select
                  id="driver_id"
                  name="driver_id"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.driver_id}
                  onChange={handleInputChange}
                >
                  <option value="">Selecionar condutor</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.internal_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="grid gap-2">
                <Label htmlFor="refuel_date">Data *</Label>
                <Input
                  id="refuel_date"
                  name="refuel_date"
                  type="date"
                  required
                  value={formData.refuel_date}
                  onChange={handleInputChange}
                />
              </div>

              {/* Time */}
              <div className="grid gap-2">
                <Label htmlFor="refuel_time">Hora</Label>
                <Input
                  id="refuel_time"
                  name="refuel_time"
                  type="time"
                  value={formData.refuel_time}
                  onChange={handleInputChange}
                />
              </div>

              {/* Odometer Reading */}
              <div className="grid gap-2">
                <Label htmlFor="odometer_reading">Quilometragem *</Label>
                <Input
                  id="odometer_reading"
                  name="odometer_reading"
                  type="number"
                  required
                  min="0"
                  placeholder="150000"
                  value={formData.odometer_reading}
                  onChange={handleInputChange}
                />
              </div>

              {/* Liters */}
              <div className="grid gap-2">
                <Label htmlFor="liters">Litros *</Label>
                <Input
                  id="liters"
                  name="liters"
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  placeholder="50.00"
                  value={formData.liters}
                  onChange={handleInputChange}
                />
              </div>

              {/* Cost per liter */}
              <div className="grid gap-2">
                <Label htmlFor="cost_per_liter">Preço por Litro (€) *</Label>
                <Input
                  id="cost_per_liter"
                  name="cost_per_liter"
                  type="number"
                  step="0.001"
                  required
                  min="0.001"
                  placeholder="1.450"
                  value={formData.cost_per_liter}
                  onChange={handleInputChange}
                />
              </div>

              {/* Total cost */}
              <div className="grid gap-2">
                <Label htmlFor="total_cost">Custo Total (€)</Label>
                <div className="relative">
                  <Input
                    id="total_cost"
                    name="total_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="72.50"
                    value={formData.total_cost}
                    onChange={handleInputChange}
                  />
                  <Calculator className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente:{" "}
                  {formData.liters && formData.cost_per_liter
                    ? `${formData.liters} × €${formData.cost_per_liter} = €${(Number(formData.liters) * Number(formData.cost_per_liter)).toFixed(2)}`
                    : "Preencha litros e preço por litro"}
                </p>
              </div>

              {/* Receipt number */}
              <div className="grid gap-2">
                <Label htmlFor="receipt_number">Número do Recibo</Label>
                <Input
                  id="receipt_number"
                  name="receipt_number"
                  placeholder="Número do recibo"
                  value={formData.receipt_number}
                  onChange={handleInputChange}
                />
              </div>

              {/* Invoice number */}
              <div className="grid gap-2">
                <Label htmlFor="invoice_number">Número da Fatura</Label>
                <Input
                  id="invoice_number"
                  name="invoice_number"
                  placeholder="Número da fatura"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                />
              </div>

              {/* Full tank checkbox */}
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="is_full_tank"
                    name="is_full_tank"
                    type="checkbox"
                    checked={formData.is_full_tank}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_full_tank">Depósito Cheio</Label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Observações adicionais sobre o abastecimento..."
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <span className="text-sm">❌ {error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>A guardar...
                  </div>
                ) : refuelRecord ? (
                  "Atualizar Abastecimento"
                ) : (
                  "Registar Abastecimento"
                )}
              </Button>
              <Link href="/refuel">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
