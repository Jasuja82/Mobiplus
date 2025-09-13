"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authService, type LoginCredentials } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface LoginFormData extends LoginCredentials {
  // Can extend with additional fields if needed
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof FormErrors]
        return newErrors
      })
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "Palavra-passe é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "Palavra-passe deve ter pelo menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await authService.signIn(formData)

      if (!response.success) {
        setErrors({
          general: response.error?.message || "Erro desconhecido durante o login",
        })
        return
      }

      console.log("✅ User logged in successfully")
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Login error:", err)
      setErrors({
        general: "Erro inesperado durante o login. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl">🚌</span>
          </div>
          <CardTitle className="text-3xl font-extrabold text-foreground">Login MobiAzores</CardTitle>
          <CardDescription>Aceda à sua conta de gestão de frota</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seu.email@mobiazores.pt"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.email && <span className="text-sm text-destructive">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-foreground">
                  Palavra-passe
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Introduza a sua palavra-passe"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.password && <span className="text-sm text-destructive">{errors.password}</span>}
              </div>
            </div>

            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
                <div className="flex">
                  <span className="text-sm">❌ {errors.general}</span>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" loading={loading}>
              {loading ? "A fazer login..." : "Entrar"}
            </Button>

            <div className="text-center space-y-2">
              <Link href="/signup" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Não tem conta? Registar-se
              </Link>

              <p className="text-xs text-muted-foreground">Sistema de Gestão de Frota MobiAzores</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
