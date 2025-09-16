export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  timestamp: string
  path: string
  method?: string
}

export interface ApiResponse {
  status: number
  message: string
  data?: any
  error?: any
  duration?: number
  context: LogContext
}

export class DebugLogger {
  private static instance: DebugLogger
  private logs: ApiResponse[] = []

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger()
    }
    return DebugLogger.instance
  }

  logResponse(response: ApiResponse): void {
    const structuredLog = {
      ...response,
      context: {
        ...response.context,
        timestamp: new Date().toISOString(),
      },
    }

    this.logs.push(structuredLog)

    // Console output with color coding
    const statusColor = this.getStatusColor(response.status)
    const prefix = `[v0-${response.context.path}]`

    console.log(`${prefix} ${statusColor}${response.status}${"\x1b[0m"} - ${response.message}`)

    if (response.data) {
      console.log(`${prefix} Data:`, response.data)
    }

    if (response.error) {
      console.error(`${prefix} Error:`, response.error)
    }

    if (response.duration) {
      console.log(`${prefix} Duration: ${response.duration}ms`)
    }

    // Issue detection
    this.detectIssues(response)
  }

  private getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return "\x1b[32m" // Green
    if (status >= 300 && status < 400) return "\x1b[33m" // Yellow
    if (status >= 400 && status < 500) return "\x1b[31m" // Red
    if (status >= 500) return "\x1b[35m" // Magenta
    return "\x1b[0m" // Reset
  }

  private detectIssues(response: ApiResponse): void {
    const issues: string[] = []

    // Performance issues
    if (response.duration && response.duration > 5000) {
      issues.push(`⚠️  SLOW_RESPONSE: Request took ${response.duration}ms (>5s)`)
    }

    // Authentication issues
    if (response.status === 401) {
      issues.push(`🔒 AUTH_REQUIRED: User needs to authenticate`)
    }

    if (response.status === 403) {
      issues.push(`🚫 FORBIDDEN: User lacks required permissions`)
    }

    // Database issues
    if (response.error?.message?.includes("connection")) {
      issues.push(`💾 DB_CONNECTION: Database connection issue detected`)
    }

    // Rate limiting
    if (response.status === 429) {
      issues.push(`🚦 RATE_LIMITED: Too many requests`)
    }

    // Server errors
    if (response.status >= 500) {
      issues.push(`💥 SERVER_ERROR: Internal server error occurred`)
    }

    // Validation errors
    if (response.status === 400 && response.error?.validation) {
      issues.push(`📝 VALIDATION_ERROR: Input validation failed`)
    }

    // Log issues if found
    if (issues.length > 0) {
      console.warn(`[v0-ISSUES] Detected ${issues.length} potential issue(s):`)
      issues.forEach((issue) => console.warn(`  ${issue}`))
    }
  }

  getLogs(filter?: {
    status?: number
    path?: string
    since?: Date
    hasErrors?: boolean
  }): ApiResponse[] {
    let filteredLogs = [...this.logs]

    if (filter?.status) {
      filteredLogs = filteredLogs.filter((log) => log.status === filter.status)
    }

    if (filter?.path) {
      filteredLogs = filteredLogs.filter((log) => log.context.path.includes(filter.path!))
    }

    if (filter?.since) {
      filteredLogs = filteredLogs.filter((log) => new Date(log.context.timestamp) >= filter.since!)
    }

    if (filter?.hasErrors) {
      filteredLogs = filteredLogs.filter((log) => log.error)
    }

    return filteredLogs
  }

  clearLogs(): void {
    this.logs = []
    console.log("[v0-DEBUG] Logs cleared")
  }
}

export const logger = DebugLogger.getInstance()

export function logApiCall(
  path: string,
  method: string,
  status: number,
  message: string,
  data?: any,
  error?: any,
  startTime?: number,
) {
  const duration = startTime ? Date.now() - startTime : undefined

  logger.logResponse({
    status,
    message,
    data,
    error,
    duration,
    context: {
      path,
      method,
      timestamp: new Date().toISOString(),
    },
  })
}

export function logAuthEvent(
  event: "login" | "logout" | "signup" | "verify",
  status: number,
  userId?: string,
  error?: any,
) {
  logger.logResponse({
    status,
    message: `Authentication ${event} ${status >= 200 && status < 300 ? "successful" : "failed"}`,
    data: userId ? { userId } : undefined,
    error,
    context: {
      path: `/auth/${event}`,
      timestamp: new Date().toISOString(),
      userId,
    },
  })
}

export function logDatabaseOperation(
  operation: string,
  table: string,
  status: number,
  rowsAffected?: number,
  error?: any,
  startTime?: number,
) {
  const duration = startTime ? Date.now() - startTime : undefined

  logger.logResponse({
    status,
    message: `Database ${operation} on ${table}`,
    data: rowsAffected ? { rowsAffected } : undefined,
    error,
    duration,
    context: {
      path: `/db/${table}`,
      method: operation.toUpperCase(),
      timestamp: new Date().toISOString(),
    },
  })
}
