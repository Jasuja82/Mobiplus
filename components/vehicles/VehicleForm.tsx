"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Department, VehicleCategory, Vehicle, VehicleFormData, ApiResponse } from "@/types"
import { VehicleFormSchema } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface VehicleFormProps {
  departments: Department[]
  categories: VehicleCategory[]
  vehicle?: Vehicle // Properly typed vehicle prop
}

export function VehicleForm({ departments, categories, vehicle }: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    license_plate: vehicle?.license_plate || "",
    make: vehicle?.make || "",
    model: vehicle?.model || "",
    year: vehicle?.year || new Date().getFullYear(),
    vin: vehicle?.vin || undefined,
    category_id: vehicle?.category_id || undefined,
    department_id: vehicle?.department_id || undefined,
    fuel_type: vehicle?.fuel_type || "diesel",
    fuel_capacity: vehicle?.fuel_capacity || undefined,
    status: vehicle?.status || "active",
    purchase_date: vehicle?.purchase_date || undefined,
    purchase_price: vehicle?.purchase_price || undefined,
    current_mileage: vehicle?.current_mileage || 0,
    insurance_policy: vehicle?.insurance_policy || undefined,
    insurance_expiry: vehicle?.insurance_expiry || undefined,
    inspection_expiry: vehicle?.inspection_expiry || undefined,
    notes: vehicle?.notes || undefined,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({}) // Added validation errors state
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" || name === "current_mileage" || name === "fuel_capacity" || name === "purchase_price"
          ? value === ""
            ? undefined
            : Number(value)
          : value === ""
            ? undefined
            : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setValidationErrors({})

    try {
      const validatedData = VehicleFormSchema.parse(formData)

      const supabase = createClient()

      let result: ApiResponse
      if (vehicle) {
        // Update existing vehicle
        const { error } = await supabase.from("vehicles").update(validatedData).eq("id", vehicle.id)

        result = { success: !error, error: error?.message }
      } else {
        // Create new vehicle
        const { error } = await supabase.from("vehicles").insert(validatedData)

        result = { success: !error, error: error?.message }
      }

      if (!result.success) {
        throw new Error(result.error || "Erro desconhecido")
      }

      console.log("✅ Vehicle saved successfully")
      router.push("/vehicles")
    } catch (err) {
      console.error("Error saving vehicle:", err)

      if (err instanceof Error && err.name === "ZodError") {
        const zodError = err as any
        const fieldErrors: Record<string, string> = {}
        zodError.errors?.forEach((error: any) => {
          if (error.path?.length > 0) {
            fieldErrors[error.path[0]] = error.message
          }
        })
        setValidationErrors(fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : "Erro ao guardar veículo")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vehicles">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{vehicle ? "Editar Veículo" : "Dados do Veículo"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* License Plate */}
              <div className="grid gap-2">
                <Label htmlFor="license_plate">Matrícula *</Label>
                <Input
                  id="license_plate"
                  name="license_plate"
                  required
                  placeholder="XX-XX-XX"
                  value={formData.license_plate}
                  onChange={handleInputChange}
                  className={validationErrors.license_plate ? "border-red-500" : ""} // Added error styling
                />
                {validationErrors.license_plate && (
                  <span className="text-sm text-red-500">{validationErrors.license_plate}</span>
                )}
              </div>

              {/* Make */}
              <div className="grid gap-2">
                <Label htmlFor="make">Marca *</Label>
                <Input
                  id="make"
                  name="make"
                  required
                  placeholder="Mercedes, Volvo, etc."
                  value={formData.make}
                  onChange={handleInputChange}
                  className={validationErrors.make ? "border-red-500" : ""}
                />
                {validationErrors.make && <span className="text-sm text-red-500">{validationErrors.make}</span>}
              </div>

              {/* Model */}
              <div className="grid gap-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  name="model"
                  required
                  placeholder="Citaro, 7900, etc."
                  value={formData.model}
                  onChange={handleInputChange}
                  className={validationErrors.model ? "border-red-500" : ""}
                />
                {validationErrors.model && <span className="text-sm text-red-500">{validationErrors.model}</span>}
              </div>

              {/* Year */}
              <div className="grid gap-2">
                <Label htmlFor="year">Ano *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  required
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleInputChange}
                  className={validationErrors.year ? "border-red-500" : ""}
                />
                {validationErrors.year && <span className="text-sm text-red-500">{validationErrors.year}</span>}
              </div>

              {/* VIN */}
              <div className="grid gap-2">
                <Label htmlFor="vin">Número de Chassis (VIN)</Label>
                <Input
                  id="vin"
                  name="vin"
                  placeholder="17 caracteres"
                  value={formData.vin}
                  onChange={handleInputChange}
                  className={validationErrors.vin ? "border-red-500" : ""}
                />
                {validationErrors.vin && <span className="text-sm text-red-500">{validationErrors.vin}</span>}
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category_id">Categoria</Label>
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
                {validationErrors.category_id && (
                  <span className="text-sm text-red-500">{validationErrors.category_id}</span>
                )}
              </div>

              {/* Department */}
              <div className="grid gap-2">
                <Label htmlFor="department_id">Departamento</Label>
                <select
                  id="department_id"
                  name="department_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.department_id}
                  onChange={handleInputChange}
                >
                  <option value="">Selecionar departamento</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {validationErrors.department_id && (
                  <span className="text-sm text-red-500">{validationErrors.department_id}</span>
                )}
              </div>

              {/* Fuel Type */}
              <div className="grid gap-2">
                <Label htmlFor="fuel_type">Tipo de Combustível</Label>
                <select
                  id="fuel_type"
                  name="fuel_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                >
                  <option value="diesel">Diesel</option>
                  <option value="gasoline">Gasolina</option>
                  <option value="electric">Elétrico</option>
                  <option value="hybrid">Híbrido</option>
                </select>
                {validationErrors.fuel_type && (
                  <span className="text-sm text-red-500">{validationErrors.fuel_type}</span>
                )}
              </div>

              {/* Fuel Capacity */}
              <div className="grid gap-2">
                <Label htmlFor="fuel_capacity">Capacidade do Depósito (L)</Label>
                <Input
                  id="fuel_capacity"
                  name="fuel_capacity"
                  type="number"
                  step="0.1"
                  placeholder="200"
                  value={formData.fuel_capacity}
                  onChange={handleInputChange}
                  className={validationErrors.fuel_capacity ? "border-red-500" : ""}
                />
                {validationErrors.fuel_capacity && (
                  <span className="text-sm text-red-500">{validationErrors.fuel_capacity}</span>
                )}
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  name="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Ativo</option>
                  <option value="maintenance">Em Manutenção</option>
                  <option value="inactive">Inativo</option>
                  <option value="retired">Retirado</option>
                </select>
                {validationErrors.status && <span className="text-sm text-red-500">{validationErrors.status}</span>}
              </div>

              {/* Current Mileage */}
              <div className="grid gap-2">
                <Label htmlFor="current_mileage">Quilometragem Atual *</Label>
                <Input
                  id="current_mileage"
                  name="current_mileage"
                  type="number"
                  required
                  min="0"
                  placeholder="150000"
                  value={formData.current_mileage}
                  onChange={handleInputChange}
                  className={validationErrors.current_mileage ? "border-red-500" : ""}
                />
                {validationErrors.current_mileage && (
                  <span className="text-sm text-red-500">{validationErrors.current_mileage}</span>
                )}
              </div>

              {/* Purchase Date */}
              <div className="grid gap-2">
                <Label htmlFor="purchase_date">Data de Compra</Label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  className={validationErrors.purchase_date ? "border-red-500" : ""}
                />
                {validationErrors.purchase_date && (
                  <span className="text-sm text-red-500">{validationErrors.purchase_date}</span>
                )}
              </div>

              {/* Purchase Price */}
              <div className="grid gap-2">
                <Label htmlFor="purchase_price">Preço de Compra (€)</Label>
                <Input
                  id="purchase_price"
                  name="purchase_price"
                  type="number"
                  step="0.01"
                  placeholder="150000.00"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  className={validationErrors.purchase_price ? "border-red-500" : ""}
                />
                {validationErrors.purchase_price && (
                  <span className="text-sm text-red-500">{validationErrors.purchase_price}</span>
                )}
              </div>

              {/* Insurance Policy */}
              <div className="grid gap-2">
                <Label htmlFor="insurance_policy">Apólice de Seguro</Label>
                <Input
                  id="insurance_policy"
                  name="insurance_policy"
                  placeholder="Número da apólice"
                  value={formData.insurance_policy}
                  onChange={handleInputChange}
                  className={validationErrors.insurance_policy ? "border-red-500" : ""}
                />
                {validationErrors.insurance_policy && (
                  <span className="text-sm text-red-500">{validationErrors.insurance_policy}</span>
                )}
              </div>

              {/* Insurance Expiry */}
              <div className="grid gap-2">
                <Label htmlFor="insurance_expiry">Validade do Seguro</Label>
                <Input
                  id="insurance_expiry"
                  name="insurance_expiry"
                  type="date"
                  value={formData.insurance_expiry}
                  onChange={handleInputChange}
                  className={validationErrors.insurance_expiry ? "border-red-500" : ""}
                />
                {validationErrors.insurance_expiry && (
                  <span className="text-sm text-red-500">{validationErrors.insurance_expiry}</span>
                )}
              </div>

              {/* Inspection Expiry */}
              <div className="grid gap-2">
                <Label htmlFor="inspection_expiry">Validade da Inspeção</Label>
                <Input
                  id="inspection_expiry"
                  name="inspection_expiry"
                  type="date"
                  value={formData.inspection_expiry}
                  onChange={handleInputChange}
                  className={validationErrors.inspection_expiry ? "border-red-500" : ""}
                />
                {validationErrors.inspection_expiry && (
                  <span className="text-sm text-red-500">{validationErrors.inspection_expiry}</span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Observações adicionais sobre o veículo..."
                value={formData.notes}
                onChange={handleInputChange}
                className={validationErrors.notes ? "border-red-500" : ""}
              />
              {validationErrors.notes && <span className="text-sm text-red-500">{validationErrors.notes}</span>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <span className="text-sm">❌ {error}</span>
              </div>
            )}

            {Object.keys(validationErrors).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                <span className="text-sm">⚠️ Por favor, corrija os erros nos campos destacados</span>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>A guardar...
                  </div>
                ) : vehicle ? (
                  "Atualizar Veículo"
                ) : (
                  "Criar Veículo"
                )}
              </Button>
              <Link href="/vehicles">
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
