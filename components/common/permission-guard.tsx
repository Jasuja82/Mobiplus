"use client"

import { useAuth } from "@/hooks/use-auth"
import { PermissionManager, type UserRole } from "@/lib/permissions"
import type { ReactNode } from "react"

interface PermissionGuardProps {
  resource: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  resourceData?: any
}

export function PermissionGuard({ resource, action, children, fallback = null, resourceData }: PermissionGuardProps) {
  const { user } = useAuth()

  if (!user) return fallback

  const hasPermission = PermissionManager.hasPermission(user.role as UserRole, resource, action, user, resourceData)

  return hasPermission ? <>{children}</> : <>{fallback}</>
}

interface RoleGuardProps {
  roles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role as UserRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
