"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService, type LoginCredentials } from "@/lib/auth"

export default function LoginPage() {
  console.log("[v0] Login page component loaded")

  const router = useRouter()
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("[v0] Login form submitted")

    setLoading(true)
    setError(null)

    try {
      const result = await authService.signIn(formData)

      if (result.success && result.data) {
        console.log("[v0] Login successful, redirecting to dashboard")
        router.push("/dashboard")
        router.refresh()
      } else {
        console.log("[v0] Login failed:", result.error?.message)
        setError(result.error?.message || "Erro no login")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Erro inesperado. Tente novamente.")
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
                  disabled={loading}
                />
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
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full"
              loading={loading}
            >
              {loading ? "A fazer login..." : "Entrar"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer">
                Não tem conta? Registar-se
              </p>
              <p className="text-xs text-muted-foreground">Sistema de Gestão de Frota MobiAzores</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
