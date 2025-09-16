import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/debug/logger"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.logResponse({
        status: 401,
        message: "Authentication required for debug logs",
        error: authError,
        context: {
          path: "/api/debug/logs",
          method: "GET",
          timestamp: new Date().toISOString(),
        },
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      logger.logResponse({
        status: 403,
        message: "Admin role required for debug logs",
        context: {
          path: "/api/debug/logs",
          method: "GET",
          timestamp: new Date().toISOString(),
          userId: user.id,
        },
      })
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const path = searchParams.get("path")
    const since = searchParams.get("since")
    const hasErrors = searchParams.get("hasErrors") === "true"

    const filter: any = {}
    if (status) filter.status = Number.parseInt(status)
    if (path) filter.path = path
    if (since) filter.since = new Date(since)
    if (hasErrors) filter.hasErrors = hasErrors

    const logs = logger.getLogs(filter)
    const duration = Date.now() - startTime

    logger.logResponse({
      status: 200,
      message: `Retrieved ${logs.length} debug logs`,
      data: { count: logs.length },
      duration,
      context: {
        path: "/api/debug/logs",
        method: "GET",
        timestamp: new Date().toISOString(),
        userId: user.id,
      },
    })

    return NextResponse.json({
      logs,
      count: logs.length,
      filters: filter,
    })
  } catch (error) {
    const duration = Date.now() - startTime

    logger.logResponse({
      status: 500,
      message: "Failed to retrieve debug logs",
      error,
      duration,
      context: {
        path: "/api/debug/logs",
        method: "GET",
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    logger.clearLogs()
    const duration = Date.now() - startTime

    logger.logResponse({
      status: 200,
      message: "Debug logs cleared successfully",
      duration,
      context: {
        path: "/api/debug/logs",
        method: "DELETE",
        timestamp: new Date().toISOString(),
        userId: user.id,
      },
    })

    return NextResponse.json({ message: "Logs cleared successfully" })
  } catch (error) {
    const duration = Date.now() - startTime

    logger.logResponse({
      status: 500,
      message: "Failed to clear debug logs",
      error,
      duration,
      context: {
        path: "/api/debug/logs",
        method: "DELETE",
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
