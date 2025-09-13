"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { RefuelRecordInsert } from "@/types/database"
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
  make: string
  model: string
  current_mileage: number
  fuel_capacity: number | null
}

interface Driver {
  id: string
  license_number: string
  user?: {
    name: string
  } | null
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
    mileage: refuelRecord?.mileage || "",
    liters: refuelRecord?.liters || "",
    cost_per_liter: refuelRecord?.cost_per_liter || "",
    total_cost: refuelRecord?.total_cost || "",
    fuel_station: refuelRecord?.fuel_station || "",
    receipt_number: refuelRecord?.receipt_number || "",
    notes: refuelRecord?.notes || "",
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

      // Auto-fill mileage if not already set
      if (vehicle && !formData.mileage) {
        setFormData((prev) => ({
          ...prev,
          mileage: vehicle.current_mileage.toString(),
        }))
      }
    } else {
      setSelectedVehicle(null)
    }
  }, [formData.vehicle_id, vehicles, formData.mileage])

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
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (
      !formData.vehicle_id ||
      !formData.refuel_date ||
      !formData.mileage ||
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

    if (Number(formData.mileage) < 0) {
      setError("A quilometragem não pode ser negativa")
      return false
    }

    // Check if mileage is reasonable compared to vehicle's current mileage
    if (selectedVehicle && Number(formData.mileage) < selectedVehicle.current_mileage - 1000) {
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

      const refuelData: RefuelRecordInsert = {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null,
        refuel_date: refuelDateTime.toISOString(),
        mileage: Number(formData.mileage),
        liters: Number(formData.liters),
        cost_per_liter: Number(formData.cost_per_liter),
        total_cost: Number(formData.total_cost),
        fuel_station: formData.fuel_station || null,
        receipt_number: formData.receipt_number || null,
        notes: formData.notes || null,
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
      if (selectedVehicle && Number(formData.mileage) > selectedVehicle.current_mileage) {
        await supabase
          .from("vehicles")
          .update({ current_mileage: Number(formData.mileage) })
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
                      {vehicle.license_plate} - {vehicle.make} {vehicle.model}
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
                <Label htmlFor="driver_id">Condutor</Label>
                <select
                  id="driver_id"
                  name="driver_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.driver_id}
                  onChange={handleInputChange}
                >
                  <option value="">Selecionar condutor (opcional)</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.user?.name || driver.license_number}
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

              {/* Mileage */}
              <div className="grid gap-2">
                <Label htmlFor="mileage">Quilometragem *</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  required
                  min="0"
                  placeholder="150000"
                  value={formData.mileage}
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

              {/* Fuel station */}
              <div className="grid gap-2">
                <Label htmlFor="fuel_station">Posto de Combustível</Label>
                <Input
                  id="fuel_station"
                  name="fuel_station"
                  placeholder="Galp, BP, Repsol, etc."
                  value={formData.fuel_station}
                  onChange={handleInputChange}
                />
              </div>

              {/* Receipt number */}
              <div className="grid gap-2">
                <Label htmlFor="receipt_number">Número do Recibo</Label>
                <Input
                  id="receipt_number"
                  name="receipt_number"
                  placeholder="Número do recibo/fatura"
                  value={formData.receipt_number}
                  onChange={handleInputChange}
                />
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
