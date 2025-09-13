"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Department, Location } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface DepartmentFormData {
  name: string
  description: string
  budget: number | undefined
  manager_id: string | undefined
  location_id: string | undefined
}

interface DepartmentFormProps {
  locations: Location[]
  department?: Department
}

export function DepartmentForm({ locations, department }: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: department?.name || "",
    description: department?.description || "",
    budget: department?.budget || undefined,
    manager_id: department?.manager_id || undefined,
    location_id: department?.location_id || undefined,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
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
      [name]: name === "budget" ? (value === "" ? undefined : Number(value)) : value === "" ? undefined : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setValidationErrors({})

    // Basic validation
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      const url = department ? `/api/departments/${department.id}` : "/api/departments"
      const method = department ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao guardar departamento")
      }

      console.log("✅ Department saved successfully")
      router.push("/departments")
    } catch (err) {
      console.error("Error saving department:", err)
      setError(err instanceof Error ? err.message : "Erro ao guardar departamento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/departments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{department ? "Editar Departamento" : "Dados do Departamento"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Nome do departamento"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && <span className="text-sm text-red-500">{validationErrors.name}</span>}
              </div>

              {/* Budget */}
              <div className="grid gap-2">
                <Label htmlFor="budget">Orçamento (€)</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  placeholder="50000.00"
                  value={formData.budget || ""}
                  onChange={handleInputChange}
                  className={validationErrors.budget ? "border-red-500" : ""}
                />
                {validationErrors.budget && <span className="text-sm text-red-500">{validationErrors.budget}</span>}
              </div>

              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location_id">Localização</Label>
                <select
                  id="location_id"
                  name="location_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.location_id || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Selecionar localização</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                {validationErrors.location_id && (
                  <span className="text-sm text-red-500">{validationErrors.location_id}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descrição do departamento..."
                value={formData.description}
                onChange={handleInputChange}
                className={validationErrors.description ? "border-red-500" : ""}
              />
              {validationErrors.description && (
                <span className="text-sm text-red-500">{validationErrors.description}</span>
              )}
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
                ) : department ? (
                  "Atualizar Departamento"
                ) : (
                  "Criar Departamento"
                )}
              </Button>
              <Link href="/departments">
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
