"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Location } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface LocationFormData {
  name: string
  address: string
  city: string
  region: string
  country: string
  internal_number: string
  is_active: boolean
}

interface LocationFormProps {
  location?: Location
}

export function LocationForm({ location }: LocationFormProps) {
  const [formData, setFormData] = useState<LocationFormData>({
    name: location?.name || "",
    address: location?.address || "",
    city: location?.city || "",
    region: location?.region || "",
    country: location?.country || "Portugal",
    internal_number: location?.internal_number || "",
    is_active: location?.is_active ?? true,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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
      const url = location ? `/api/locations/${location.id}` : "/api/locations"
      const method = location ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao guardar localização")
      }

      console.log("✅ Location saved successfully")
      router.push("/locations")
    } catch (err) {
      console.error("Error saving location:", err)
      setError(err instanceof Error ? err.message : "Erro ao guardar localização")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/locations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{location ? "Editar Localização" : "Dados da Localização"}</CardTitle>
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
                  placeholder="Nome da localização"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && <span className="text-sm text-red-500">{validationErrors.name}</span>}
              </div>

              {/* Internal Number */}
              <div className="grid gap-2">
                <Label htmlFor="internal_number">Número Interno</Label>
                <Input
                  id="internal_number"
                  name="internal_number"
                  placeholder="Código interno"
                  value={formData.internal_number}
                  onChange={handleInputChange}
                  className={validationErrors.internal_number ? "border-red-500" : ""}
                />
                {validationErrors.internal_number && (
                  <span className="text-sm text-red-500">{validationErrors.internal_number}</span>
                )}
              </div>

              {/* Address */}
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Rua, número, código postal"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={validationErrors.address ? "border-red-500" : ""}
                />
                {validationErrors.address && <span className="text-sm text-red-500">{validationErrors.address}</span>}
              </div>

              {/* City */}
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={validationErrors.city ? "border-red-500" : ""}
                />
                {validationErrors.city && <span className="text-sm text-red-500">{validationErrors.city}</span>}
              </div>

              {/* Region */}
              <div className="grid gap-2">
                <Label htmlFor="region">Região</Label>
                <Input
                  id="region"
                  name="region"
                  placeholder="Região/Distrito"
                  value={formData.region}
                  onChange={handleInputChange}
                  className={validationErrors.region ? "border-red-500" : ""}
                />
                {validationErrors.region && <span className="text-sm text-red-500">{validationErrors.region}</span>}
              </div>

              {/* Country */}
              <div className="grid gap-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="País"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={validationErrors.country ? "border-red-500" : ""}
                />
                {validationErrors.country && <span className="text-sm text-red-500">{validationErrors.country}</span>}
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="is_active">Estado</Label>
                <select
                  id="is_active"
                  name="is_active"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.is_active.toString()}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value === "true" }))}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
                {validationErrors.is_active && (
                  <span className="text-sm text-red-500">{validationErrors.is_active}</span>
                )}
              </div>
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
                ) : location ? (
                  "Atualizar Localização"
                ) : (
                  "Criar Localização"
                )}
              </Button>
              <Link href="/locations">
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
