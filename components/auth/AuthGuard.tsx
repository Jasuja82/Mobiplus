"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService, type AuthUser } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  requiredRoles?: string[] // Added support for multiple roles
  fallbackPath?: string // Added customizable fallback path
}

export default function AuthGuard({ children, requiredRole, requiredRoles, fallbackPath = "/login" }: AuthGuardProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null) // Added error state
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser()

        if (!response.success || !response.data) {
          console.log("No authenticated user, redirecting to login")
          router.push(fallbackPath)
          return
        }

        const currentUser = response.data

        if (requiredRole && !authService.hasRole(currentUser, requiredRole)) {
          console.log(`User lacks required role: ${requiredRole}`)
          setError(`Acesso negado. É necessário o papel: ${requiredRole}`)
          router.push("/unauthorized")
          return
        }

        if (requiredRoles && !authService.hasAnyRole(currentUser, requiredRoles)) {
          console.log(`User lacks any of required roles: ${requiredRoles.join(", ")}`)
          setError(`Acesso negado. É necessário um dos papéis: ${requiredRoles.join(", ")}`)
          router.push("/unauthorized")
          return
        }

        setUser(currentUser)
        setError(null)
      } catch (error) {
        console.error("Auth check failed:", error)
        setError("Erro na verificação de autenticação")
        router.push(fallbackPath)
      } finally {
        setLoading(false)
      }
    }

    void checkAuth()

    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user as AuthUser)
        setError(null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setError(null)
        router.push(fallbackPath)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user as AuthUser)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, requiredRole, requiredRoles, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">A verificar autenticação...</p>
            <p className="text-sm text-gray-500">Por favor aguarde</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-6xl">⚠️</div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Erro de Autenticação</p>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => router.push(fallbackPath)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
