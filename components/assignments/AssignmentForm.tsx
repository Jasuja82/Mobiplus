"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { AssignmentType } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AssignmentFormData {
  name: string
  description: string
}

interface AssignmentFormProps {
  assignment?: AssignmentType
}

export function AssignmentForm({ assignment }: AssignmentFormProps) {
  const [formData, setFormData] = useState<AssignmentFormData>({
    name: assignment?.name || "",
    description: assignment?.description || "",
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      [name]: value,
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
      const url = assignment ? `/api/assignments/${assignment.id}` : "/api/assignments"
      const method = assignment ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao guardar atribuição")
      }

      console.log("✅ Assignment saved successfully")
      router.push("/assignments")
    } catch (err) {
      console.error("Error saving assignment:", err)
      setError(err instanceof Error ? err.message : "Erro ao guardar atribuição")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/assignments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{assignment ? "Editar Atribuição" : "Dados da Atribuição"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Nome da atribuição (ex: Urbana, Interurbana, Escolar)"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && <span className="text-sm text-red-500">{validationErrors.name}</span>}
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descrição da atribuição..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className={validationErrors.description ? "border-red-500" : ""}
                />
                {validationErrors.description && (
                  <span className="text-sm text-red-500">{validationErrors.description}</span>
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
                ) : assignment ? (
                  "Atualizar Atribuição"
                ) : (
                  "Criar Atribuição"
                )}
              </Button>
              <Link href="/assignments">
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
