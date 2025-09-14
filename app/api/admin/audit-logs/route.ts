import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const user = searchParams.get("user")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    let query = supabase
      .from("audit_logs")
      .select(`
        *,
        users:user_id (
          email,
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (action && action !== "all") {
      query = query.eq("action", action)
    }

    if (user && user !== "all") {
      query = query.eq("user_role", user)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({
        logs: [],
        error: "Failed to fetch audit logs",
      })
    }

    const transformedLogs =
      logs?.map((log) => ({
        id: log.id,
        timestamp: log.created_at,
        user_email: log.users?.email || "Unknown",
        action: log.action,
        resource: log.resource_type,
        ip_address: log.ip_address,
        status: log.status || "success",
        details: log.details,
      })) || []

    return NextResponse.json({
      logs: transformedLogs,
      total: transformedLogs.length,
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      {
        logs: [],
        error: "Failed to fetch audit logs",
      },
      { status: 500 },
    )
  }
}
