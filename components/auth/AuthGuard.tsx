"use client"

import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { authService, type AuthUser } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  requiredRoles?: string[]
  fallbackPath?: string
}

export default function AuthGuard({ children, requiredRole, requiredRoles, fallbackPath = "/login" }: AuthGuardProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const hasRequiredPermissions = useCallback(
    (currentUser: AuthUser) => {
      if (requiredRole && !authService.hasRole(currentUser, requiredRole)) {
        return { hasPermission: false, error: `Acesso negado. É necessário o papel: ${requiredRole}` }
      }

      if (requiredRoles && !authService.hasAnyRole(currentUser, requiredRoles)) {
        return { hasPermission: false, error: `Acesso negado. É necessário um dos papéis: ${requiredRoles.join(", ")}` }
      }

      return { hasPermission: true, error: null }
    },
    [requiredRole, requiredRoles],
  )

  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser()

      if (!response.success || !response.data) {
        console.log("No authenticated user, redirecting to login")
        router.push(fallbackPath)
        return
      }

      const currentUser = response.data
      const { hasPermission, error: permissionError } = hasRequiredPermissions(currentUser)

      if (!hasPermission) {
        console.log(permissionError)
        setError(permissionError)
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
  }, [router, fallbackPath, hasRequiredPermissions])

  const handleAuthStateChange = useCallback(
    (event: string, session: any) => {
      console.log(`Auth state changed: ${event}`)

      if (event === "SIGNED_IN" && session?.user) {
        const currentUser = session.user as AuthUser
        const { hasPermission, error: permissionError } = hasRequiredPermissions(currentUser)

        if (hasPermission) {
          setUser(currentUser)
          setError(null)
        } else {
          setError(permissionError)
          router.push("/unauthorized")
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setError(null)
        router.push(fallbackPath)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user as AuthUser)
      }

      setLoading(false)
    },
    [hasRequiredPermissions, router, fallbackPath],
  )

  useEffect(() => {
    checkAuth()

    const {
      data: { subscription },
    } = authService.onAuthStateChange(handleAuthStateChange)

    return () => {
      subscription.unsubscribe()
    }
  }, [checkAuth, handleAuthStateChange])

  const LoadingComponent = useMemo(
    () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">A verificar autenticação...</p>
            <p className="text-sm text-gray-500">Por favor aguarde</p>
          </div>
        </div>
      </div>
    ),
    [],
  )

  const ErrorComponent = useMemo(
    () => (
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
    ),
    [error, router, fallbackPath],
  )

  if (loading) return LoadingComponent
  if (error) return ErrorComponent
  if (!user) return null

  return <>{children}</>
}
