"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { DriverWithRelations } from "@/types/relations"

interface DriverFormData {
  user_id: string
  license_number: string
  license_categories: string[]
  license_expiry: string
  medical_certificate_expiry: string
  department_id: string
  is_active: boolean
  notes?: string
}

interface DriverFormProps {
  driver?: DriverWithRelations
}

interface User {
  id: string
  name: string
  email: string
}

interface Department {
  id: string
  name: string
}

const LICENSE_CATEGORIES = [
  { value: "AM", label: "AM - Ciclomotores" },
  { value: "A1", label: "A1 - Motociclos até 125cc" },
  { value: "A2", label: "A2 - Motociclos até 35kW" },
  { value: "A", label: "A - Motociclos" },
  { value: "B1", label: "B1 - Triciclos e quadriciclos" },
  { value: "B", label: "B - Automóveis ligeiros" },
  { value: "C1", label: "C1 - Veículos até 7500kg" },
  { value: "C", label: "C - Veículos pesados" },
  { value: "D1", label: "D1 - Minibus até 16 lugares" },
  { value: "D", label: "D - Autocarros" },
  { value: "BE", label: "BE - Ligeiros com reboque" },
  { value: "C1E", label: "C1E - C1 com reboque" },
  { value: "CE", label: "CE - C com reboque" },
  { value: "D1E", label: "D1E - D1 com reboque" },
  { value: "DE", label: "DE - D com reboque" },
]

export function DriverForm({ driver }: DriverFormProps) {
  const [formData, setFormData] = useState<DriverFormData>({
    user_id: driver?.user_id || "",
    license_number: driver?.license_number || "",
    license_categories: driver?.license_categories || [],
    license_expiry: driver?.license_expiry || "",
    medical_certificate_expiry: driver?.medical_certificate_expiry || "",
    department_id: driver?.department_id || "",
    is_active: driver?.is_active ?? true,
    notes: driver?.notes || "",
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const router = useRouter()

  useEffect(() => {
    // Fetch users and departments
    const fetchData = async () => {
      try {
        const [usersRes, departmentsRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/departments")])

        const usersData = await usersRes.json()
        const departmentsData = await departmentsRes.json()

        if (usersData.users) setUsers(usersData.users)
        if (departmentsData.success) setDepartments(departmentsData.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

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

  const handleSelectChange = (name: string, value: string) => {
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

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      license_categories: checked
        ? [...prev.license_categories, category]
        : prev.license_categories.filter((c) => c !== category),
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setValidationErrors({})

    // Basic validation
    const errors: Record<string, string> = {}
    if (!formData.user_id) errors.user_id = "Utilizador é obrigatório"
    if (!formData.license_number.trim()) errors.license_number = "Número da carta é obrigatório"
    if (formData.license_categories.length === 0) errors.license_categories = "Pelo menos uma categoria é obrigatória"
    if (!formData.license_expiry) errors.license_expiry = "Data de validade da carta é obrigatória"
    if (!formData.medical_certificate_expiry)
      errors.medical_certificate_expiry = "Data de validade do certificado médico é obrigatória"
    if (!formData.department_id) errors.department_id = "Departamento é obrigatório"

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      const url = driver ? `/api/drivers/${driver.id}` : "/api/drivers"
      const method = driver ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao guardar condutor")
      }

      console.log("✅ Driver saved successfully")
      router.push("/drivers")
    } catch (err) {
      console.error("Error saving driver:", err)
      setError(err instanceof Error ? err.message : "Erro ao guardar condutor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/drivers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{driver ? "Editar Condutor" : "Novo Condutor"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Selection */}
              <div className="grid gap-2">
                <Label htmlFor="user_id">Utilizador *</Label>
                <Select value={formData.user_id} onValueChange={(value) => handleSelectChange("user_id", value)}>
                  <SelectTrigger className={validationErrors.user_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecionar utilizador" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.user_id && <span className="text-sm text-red-500">{validationErrors.user_id}</span>}
              </div>

              {/* Department */}
              <div className="grid gap-2">
                <Label htmlFor="department_id">Departamento *</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => handleSelectChange("department_id", value)}
                >
                  <SelectTrigger className={validationErrors.department_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.department_id && (
                  <span className="text-sm text-red-500">{validationErrors.department_id}</span>
                )}
              </div>

              {/* License Number */}
              <div className="grid gap-2">
                <Label htmlFor="license_number">Número da Carta *</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  required
                  placeholder="Ex: 12345678"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  className={validationErrors.license_number ? "border-red-500" : ""}
                />
                {validationErrors.license_number && (
                  <span className="text-sm text-red-500">{validationErrors.license_number}</span>
                )}
              </div>

              {/* License Expiry */}
              <div className="grid gap-2">
                <Label htmlFor="license_expiry">Validade da Carta *</Label>
                <Input
                  id="license_expiry"
                  name="license_expiry"
                  type="date"
                  required
                  value={formData.license_expiry}
                  onChange={handleInputChange}
                  className={validationErrors.license_expiry ? "border-red-500" : ""}
                />
                {validationErrors.license_expiry && (
                  <span className="text-sm text-red-500">{validationErrors.license_expiry}</span>
                )}
              </div>

              {/* Medical Certificate Expiry */}
              <div className="grid gap-2">
                <Label htmlFor="medical_certificate_expiry">Validade Certificado Médico *</Label>
                <Input
                  id="medical_certificate_expiry"
                  name="medical_certificate_expiry"
                  type="date"
                  required
                  value={formData.medical_certificate_expiry}
                  onChange={handleInputChange}
                  className={validationErrors.medical_certificate_expiry ? "border-red-500" : ""}
                />
                {validationErrors.medical_certificate_expiry && (
                  <span className="text-sm text-red-500">{validationErrors.medical_certificate_expiry}</span>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Condutor ativo</Label>
              </div>
            </div>

            {/* License Categories */}
            <div className="grid gap-2">
              <Label>Categorias da Carta *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg">
                {LICENSE_CATEGORIES.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={formData.license_categories.includes(category.value)}
                      onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                    />
                    <Label htmlFor={category.value} className="text-sm font-normal">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
              {validationErrors.license_categories && (
                <span className="text-sm text-red-500">{validationErrors.license_categories}</span>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Notas adicionais sobre o condutor..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
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
                ) : driver ? (
                  "Atualizar Condutor"
                ) : (
                  "Criar Condutor"
                )}
              </Button>
              <Link href="/drivers">
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
