import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { PermissionManager, type UserRole } from "./permissions"

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set() {},
      remove() {},
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 })
  }

  const userWithProfile = { ...user, ...profile }
  return handler(request, userWithProfile)
}

export function withPermission(
  resource: string,
  action: string,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
) {
  return async (request: NextRequest, user: any) => {
    const hasPermission = PermissionManager.hasPermission(user.role as UserRole, resource, action, user)

    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return handler(request, user)
  }
}
