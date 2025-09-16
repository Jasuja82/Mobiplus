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
import { odometerValidator, type OdometerValidationResult } from "@/lib/validations/odometer"

interface Vehicle {
  id: string
  license_plate: string
  internal_number: string
  make_id: string | null
  model_id: string | null
  current_mileage: number
  fuel_capacity: number | null
}

interface Driver {
  id: string
  full_name: string
  code: string
}

interface Location {
  id: string
  name: string
  city: string
  region: string
}

interface AssignmentType {
  id: string
  name: string
  description: string
  color: string
}

interface FuelStation {
  id: string
  name: string
  brand: string
  address: string
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
    location_id: refuelRecord?.location_id || "",
    assignment_type_id: refuelRecord?.assignment_type_id || "",
    receipt_number: refuelRecord?.receipt_number || "",
    invoice_number: refuelRecord?.invoice_number || "",
    notes: refuelRecord?.notes || "",
    is_full_tank: refuelRecord?.is_full_tank ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [odometerValidation, setOdometerValidation] = useState<OdometerValidationResult | null>(null)
  const [isValidatingOdometer, setIsValidatingOdometer] = useState(false)

  const [locations, setLocations] = useState<Location[]>([])
  const [assignmentTypes, setAssignmentTypes] = useState<AssignmentType[]>([])
  const [fuelStations, setFuelStations] = useState<FuelStation[]>([])
  const [entitiesLoading, setEntitiesLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const supabase = createClient()

        // Load locations, assignment types, and fuel stations in parallel
        const [locationsRes, assignmentTypesRes, fuelStationsRes] = await Promise.all([
          supabase.from("locations").select("id, name, city, region").eq("is_active", true).order("name"),
          supabase.from("assignment_types").select("id, name, description, color").eq("is_active", true).order("name"),
          supabase.from("fuel_stations").select("id, name, brand, address").eq("is_active", true).order("name"),
        ])

        if (locationsRes.data) setLocations(locationsRes.data)
        if (assignmentTypesRes.data) setAssignmentTypes(assignmentTypesRes.data)
        if (fuelStationsRes.data) setFuelStations(fuelStationsRes.data)

        if (locationsRes.error) console.error("Error loading locations:", locationsRes.error)
        if (assignmentTypesRes.error) console.error("Error loading assignment types:", assignmentTypesRes.error)
        if (fuelStationsRes.error) console.error("Error loading fuel stations:", fuelStationsRes.error)
      } catch (error) {
        console.error("Error loading entities:", error)
      } finally {
        setEntitiesLoading(false)
      }
    }

    loadEntities()
  }, [])

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

  useEffect(() => {
    const validateOdometer = async () => {
      if (formData.vehicle_id && formData.odometer_reading && formData.refuel_date) {
        setIsValidatingOdometer(true)
        try {
          const validation = await odometerValidator.validateOdometerReading(
            formData.vehicle_id,
            Number(formData.odometer_reading),
            formData.refuel_date,
            refuelRecord?.id,
          )
          setOdometerValidation(validation)
        } catch (error) {
          console.error("Error validating odometer:", error)
        } finally {
          setIsValidatingOdometer(false)
        }
      } else {
        setOdometerValidation(null)
      }
    }

    const timeoutId = setTimeout(validateOdometer, 500) // Debounce validation
    return () => clearTimeout(timeoutId)
  }, [formData.vehicle_id, formData.odometer_reading, formData.refuel_date, refuelRecord?.id])

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

    // Check odometer validation results
    if (odometerValidation && !odometerValidation.isValid) {
      setError(`Erro na quilometragem: ${odometerValidation.errors.join(", ")}`)
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
        location_id: formData.location_id || null,
        assignment_type_id: formData.assignment_type_id || null,
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
          <CardTitle>{refuelRecord ? "Editar Abastecimento" : "Adicionar reabastecimento"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle */}
              <div className="grid gap-2">
                <Label htmlFor="vehicle_id">Veículos *</Label>
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
                      {vehicle.internal_number.padStart(2, "0")} ({vehicle.license_plate})
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
                  placeholder="122.00"
                  value={formData.liters}
                  onChange={handleInputChange}
                />
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

              {/* Cost per liter */}
              <div className="grid gap-2">
                <Label htmlFor="cost_per_liter">Preço por litro *</Label>
                <Input
                  id="cost_per_liter"
                  name="cost_per_liter"
                  type="number"
                  step="0.001"
                  required
                  min="0.001"
                  placeholder="1.481 €"
                  value={formData.cost_per_liter}
                  onChange={handleInputChange}
                />
              </div>

              {/* Odometer Reading */}
              <div className="grid gap-2">
                <Label htmlFor="odometer_reading">Odómetro *</Label>
                {odometerValidation?.lastKnownReading && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <span className="inline-flex items-center">
                      ℹ️ Último valor: {odometerValidation.lastKnownReading.toLocaleString()}
                    </span>
                  </div>
                )}
                <Input
                  id="odometer_reading"
                  name="odometer_reading"
                  type="number"
                  required
                  min="0"
                  placeholder="644240"
                  value={formData.odometer_reading}
                  onChange={handleInputChange}
                  className={
                    odometerValidation && !odometerValidation.isValid ? "border-red-500 focus-visible:ring-red-500" : ""
                  }
                />
                {odometerValidation?.lastKnownReading && formData.odometer_reading && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Diferença no conta-quilómetros</span>
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                        Number(formData.odometer_reading) - odometerValidation.lastKnownReading < 0
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(Number(formData.odometer_reading) - odometerValidation.lastKnownReading).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Number(formData.odometer_reading).toLocaleString()} -{" "}
                      {odometerValidation.lastKnownReading.toLocaleString()} ={" "}
                      {(Number(formData.odometer_reading) - odometerValidation.lastKnownReading).toLocaleString()}
                    </div>
                  </div>
                )}
                {isValidatingOdometer && <p className="text-xs text-blue-600">🔍 A validar quilometragem...</p>}
                {odometerValidation && !odometerValidation.isValid && (
                  <div className="space-y-1">
                    {odometerValidation.errors.map((error, i) => (
                      <p key={i} className="text-sm text-red-600 font-medium">
                        {error.includes("lower than") || error.includes("menor")
                          ? `Deve ser superior a ${odometerValidation.lastKnownReading?.toLocaleString()}`
                          : error}
                      </p>
                    ))}
                  </div>
                )}
                {odometerValidation && odometerValidation.isValid && odometerValidation.warnings.length > 0 && (
                  <div className="space-y-1">
                    {odometerValidation.warnings.map((warning, i) => (
                      <p key={i} className="text-xs text-yellow-600">
                        ⚠️ {warning}
                      </p>
                    ))}
                  </div>
                )}
                {odometerValidation && odometerValidation.suggestions.length > 0 && (
                  <div className="space-y-1">
                    {odometerValidation.suggestions.map((suggestion, i) => (
                      <p key={i} className="text-xs text-green-600">
                        💡 {suggestion}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Total cost */}
              <div className="grid gap-2">
                <Label htmlFor="total_cost">Custo total</Label>
                <div className="relative">
                  <Input
                    id="total_cost"
                    name="total_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="178.24 €"
                    value={formData.total_cost}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                    readOnly
                  />
                  <Calculator className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location_id">Localização *</Label>
                <select
                  id="location_id"
                  name="location_id"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  disabled={entitiesLoading}
                >
                  <option value="">Selecionar localização</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assignment_type_id">Atribuição</Label>
                <select
                  id="assignment_type_id"
                  name="assignment_type_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.assignment_type_id}
                  onChange={handleInputChange}
                  disabled={entitiesLoading}
                >
                  <option value="">Selecionar atribuição</option>
                  {assignmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver */}
              <div className="grid gap-2">
                <Label htmlFor="driver_id">Condutor</Label>
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
                      {driver.full_name} ({driver.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Introduzir notas adicionais"
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
              <Link href="/refuel">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading || entitiesLoading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>A guardar...
                  </div>
                ) : refuelRecord ? (
                  "Atualizar"
                ) : (
                  "Gravar"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
