"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { MaintenanceScheduleInsert, MaintenanceCategory } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Vehicle {
  id: string
  license_plate: string
  make: string
  model: string
  current_mileage: number
}

interface MaintenanceScheduleFormProps {
  vehicles: Vehicle[]
  categories: MaintenanceCategory[]
  currentUserId: string
  schedule?: any // For edit mode
}

export function MaintenanceScheduleForm({
  vehicles,
  categories,
  currentUserId,
  schedule,
}: MaintenanceScheduleFormProps) {
  const [formData, setFormData] = useState({
    vehicle_id: schedule?.vehicle_id || "",
    category_id: schedule?.category_id || "",
    scheduled_date: schedule?.scheduled_date?.split("T")[0] || "",
    scheduled_mileage: schedule?.scheduled_mileage || "",
    priority: schedule?.priority || 2,
    estimated_cost: schedule?.estimated_cost || "",
    notes: schedule?.notes || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | null>(null)
  const router = useRouter()

  // Update selected vehicle when vehicle_id changes
  useEffect(() => {
    if (formData.vehicle_id) {
      const vehicle = vehicles.find((v) => v.id === formData.vehicle_id)
      setSelectedVehicle(vehicle || null)
    } else {
      setSelectedVehicle(null)
    }
  }, [formData.vehicle_id, vehicles])

  // Update selected category when category_id changes
  useEffect(() => {
    if (formData.category_id) {
      const category = categories.find((c) => c.id === formData.category_id)
      setSelectedCategory(category || null)

      // Auto-suggest scheduled mileage based on category and vehicle
      if (category && selectedVehicle && category.default_interval_km && !formData.scheduled_mileage) {
        const suggestedMileage = selectedVehicle.current_mileage + category.default_interval_km
        setFormData((prev) => ({
          ...prev,
          scheduled_mileage: suggestedMileage.toString(),
        }))
      }
    } else {
      setSelectedCategory(null)
    }
  }, [formData.category_id, categories, selectedVehicle, formData.scheduled_mileage])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.vehicle_id || !formData.scheduled_date) {
      setError("Por favor, preencha todos os campos obrigatórios")
      return false
    }

    const scheduledDate = new Date(formData.scheduled_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (scheduledDate < today) {
      setError("A data agendada não pode ser no passado")
      return false
    }

    if (formData.scheduled_mileage && Number(formData.scheduled_mileage) < 0) {
      setError("A quilometragem não pode ser negativa")
      return false
    }

    if (formData.estimated_cost && Number(formData.estimated_cost) < 0) {
      setError("O custo estimado não pode ser negativo")
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

      const scheduleData: MaintenanceScheduleInsert = {
        vehicle_id: formData.vehicle_id,
        category_id: formData.category_id || null,
        scheduled_date: formData.scheduled_date,
        scheduled_mileage: formData.scheduled_mileage ? Number(formData.scheduled_mileage) : null,
        priority: Number(formData.priority),
        estimated_cost: formData.estimated_cost ? Number(formData.estimated_cost) : null,
        notes: formData.notes || null,
        created_by: currentUserId,
      }

      let result
      if (schedule) {
        // Update existing schedule
        result = await supabase.from("maintenance_schedules").update(scheduleData).eq("id", schedule.id)
      } else {
        // Create new schedule
        result = await supabase.from("maintenance_schedules").insert(scheduleData)
      }

      if (result.error) {
        throw result.error
      }

      console.log("✅ Maintenance schedule saved successfully")
      router.push("/maintenance")
    } catch (err) {
      console.error("Error saving maintenance schedule:", err)
      setError(err instanceof Error ? err.message : "Erro ao guardar agendamento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/maintenance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{schedule ? "Editar Agendamento" : "Agendar Manutenção"}</CardTitle>
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
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category_id">Categoria de Manutenção</Label>
                <select
                  id="category_id"
                  name="category_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">Selecionar categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {selectedCategory?.description && (
                  <p className="text-xs text-muted-foreground">{selectedCategory.description}</p>
                )}
              </div>

              {/* Scheduled Date */}
              <div className="grid gap-2">
                <Label htmlFor="scheduled_date">Data Agendada *</Label>
                <Input
                  id="scheduled_date"
                  name="scheduled_date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.scheduled_date}
                  onChange={handleInputChange}
                />
              </div>

              {/* Scheduled Mileage */}
              <div className="grid gap-2">
                <Label htmlFor="scheduled_mileage">Quilometragem Agendada</Label>
                <Input
                  id="scheduled_mileage"
                  name="scheduled_mileage"
                  type="number"
                  min="0"
                  placeholder="160000"
                  value={formData.scheduled_mileage}
                  onChange={handleInputChange}
                />
                {selectedCategory?.default_interval_km && selectedVehicle && (
                  <p className="text-xs text-muted-foreground">
                    Intervalo sugerido: {selectedCategory.default_interval_km.toLocaleString()} km (próxima:{" "}
                    {(selectedVehicle.current_mileage + selectedCategory.default_interval_km).toLocaleString()} km)
                  </p>
                )}
              </div>

              {/* Priority */}
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <select
                  id="priority"
                  name="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value={1}>Baixa</option>
                  <option value={2}>Média</option>
                  <option value={3}>Alta</option>
                  <option value={4}>Urgente</option>
                </select>
              </div>

              {/* Estimated Cost */}
              <div className="grid gap-2">
                <Label htmlFor="estimated_cost">Custo Estimado (€)</Label>
                <Input
                  id="estimated_cost"
                  name="estimated_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="500.00"
                  value={formData.estimated_cost}
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
                placeholder="Descrição detalhada da manutenção a realizar..."
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
                ) : schedule ? (
                  "Atualizar Agendamento"
                ) : (
                  "Agendar Manutenção"
                )}
              </Button>
              <Link href="/maintenance">
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
