"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    employeeNumber: "",
    department: "MobiAzores",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError("Por favor, preencha todos os campos obrigatórios")
      return false
    }

    if (formData.password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As palavras-passe não coincidem")
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Por favor, insira um email válido")
      return false
    }

    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            name: formData.name,
            employee_number: formData.employeeNumber ? Number.parseInt(formData.employeeNumber) : undefined,
            department: formData.department,
          },
        },
      })

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("Este email já está registado")
        } else if (error.message.includes("Password should be")) {
          setError("A palavra-passe deve ter pelo menos 6 caracteres")
        } else {
          setError(`Erro no registo: ${error.message}`)
        }
      } else if (data.user) {
        setSuccess(true)
        console.log("✅ User registered:", data.user.email)

        // Show success message for a moment then redirect
        setTimeout(() => {
          router.push("/signup-success")
        }, 2000)
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("Erro inesperado durante o registo")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <CardTitle className="text-3xl font-extrabold text-green-900">Registo Efetuado!</CardTitle>
            <CardDescription>Verifique o seu email para ativar a conta</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">A redirecionar...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🚌</span>
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900">Registo MobiAzores</CardTitle>
          <CardDescription>Crie uma conta para gestores de frota</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-4">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seu.email@mobiazores.pt"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              {/* Employee Number */}
              <div className="grid gap-2">
                <Label htmlFor="employeeNumber">Número de Funcionário</Label>
                <Input
                  id="employeeNumber"
                  name="employeeNumber"
                  type="number"
                  placeholder="1234"
                  value={formData.employeeNumber}
                  onChange={handleInputChange}
                />
              </div>

              {/* Department */}
              <div className="grid gap-2">
                <Label htmlFor="department">Departamento</Label>
                <select
                  id="department"
                  name="department"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="MobiAzores">MobiAzores</option>
                  <option value="Frota">Gestão de Frota</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Administração">Administração</option>
                </select>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Palavra-passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Palavra-passe *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Repita a palavra-passe"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <div className="flex">
                  <span className="text-sm">❌ {error}</span>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>A criar conta...
                </div>
              ) : (
                "Criar Conta"
              )}
            </Button>

            <div className="text-center space-y-2">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                Já tem conta? Fazer login
              </Link>

              <p className="text-xs text-gray-500">
                Ao criar uma conta, concorda com os termos de utilização do sistema MobiAzores
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
