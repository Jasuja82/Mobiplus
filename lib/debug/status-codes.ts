export const HTTP_STATUS_MANUAL = {
  // 2xx Success
  200: {
    name: "OK",
    description: "Request successful",
    commonCauses: ["Successful API call", "Data retrieved successfully"],
    troubleshooting: ["Verify response data structure", "Check for null/undefined values"],
    example: "GET /api/users returns user list",
  },
  201: {
    name: "Created",
    description: "Resource created successfully",
    commonCauses: ["POST request created new resource"],
    troubleshooting: ["Verify resource was actually created", "Check location header"],
    example: "POST /api/users creates new user",
  },
  204: {
    name: "No Content",
    description: "Request successful but no content returned",
    commonCauses: ["DELETE operation", "PUT update with no response body"],
    troubleshooting: ["Normal for delete operations", "Verify operation completed"],
    example: "DELETE /api/users/123 removes user",
  },

  // 3xx Redirection
  301: {
    name: "Moved Permanently",
    description: "Resource permanently moved to new URL",
    commonCauses: ["URL structure changed", "Domain migration"],
    troubleshooting: ["Update client URLs", "Check redirect chains"],
    example: "Old API endpoint moved to new version",
  },
  302: {
    name: "Found (Temporary Redirect)",
    description: "Resource temporarily at different URL",
    commonCauses: ["Temporary maintenance", "Load balancing"],
    troubleshooting: ["Follow redirect", "Check if redirect is expected"],
    example: "Maintenance page redirect",
  },

  // 4xx Client Errors
  400: {
    name: "Bad Request",
    description: "Invalid request syntax or parameters",
    commonCauses: ["Missing required fields", "Invalid JSON format", "Wrong data types", "Validation errors"],
    troubleshooting: [
      "Check request body format",
      "Verify all required fields are present",
      "Validate data types match API expectations",
      "Review API documentation for correct format",
    ],
    example: "POST /api/users with missing email field",
  },
  401: {
    name: "Unauthorized",
    description: "Authentication required or failed",
    commonCauses: [
      "Missing authentication token",
      "Expired session/token",
      "Invalid credentials",
      "Token not in correct format",
    ],
    troubleshooting: [
      "Check if user is logged in",
      "Verify token is included in request headers",
      "Check token expiration",
      "Refresh authentication token",
      "Redirect to login page",
    ],
    example: "Accessing protected route without valid JWT",
  },
  403: {
    name: "Forbidden",
    description: "Authenticated but insufficient permissions",
    commonCauses: ["User lacks required role/permissions", "Resource access restricted", "Account suspended/disabled"],
    troubleshooting: [
      "Check user role and permissions",
      "Verify resource ownership",
      "Review access control rules",
      "Check if account is active",
    ],
    example: "Regular user trying to access admin panel",
  },
  404: {
    name: "Not Found",
    description: "Resource does not exist",
    commonCauses: [
      "Incorrect URL/endpoint",
      "Resource was deleted",
      "Typo in route path",
      "Resource ID does not exist",
    ],
    troubleshooting: [
      "Verify URL spelling and format",
      "Check if resource exists in database",
      "Review route definitions",
      "Check for case sensitivity issues",
    ],
    example: "GET /api/users/999 where user ID 999 does not exist",
  },
  409: {
    name: "Conflict",
    description: "Request conflicts with current resource state",
    commonCauses: ["Duplicate resource creation", "Concurrent modification", "Business rule violation"],
    troubleshooting: [
      "Check for existing resources with same identifier",
      "Implement proper conflict resolution",
      "Use optimistic locking for updates",
    ],
    example: "Creating user with email that already exists",
  },
  422: {
    name: "Unprocessable Entity",
    description: "Request format correct but semantically invalid",
    commonCauses: ["Validation rules failed", "Business logic constraints violated", "Invalid field combinations"],
    troubleshooting: [
      "Review validation error details",
      "Check business rule requirements",
      "Verify field value constraints",
    ],
    example: "Valid JSON but email format is invalid",
  },
  429: {
    name: "Too Many Requests",
    description: "Rate limit exceeded",
    commonCauses: ["API rate limiting triggered", "Too many requests in time window", "DDoS protection activated"],
    troubleshooting: [
      "Implement request throttling",
      "Add retry logic with backoff",
      "Check rate limit headers",
      "Consider caching responses",
    ],
    example: "More than 100 requests per minute from same IP",
  },

  // 5xx Server Errors
  500: {
    name: "Internal Server Error",
    description: "Unexpected server error occurred",
    commonCauses: [
      "Unhandled exception in code",
      "Database connection failure",
      "Third-party service error",
      "Configuration issues",
    ],
    troubleshooting: [
      "Check server logs for stack traces",
      "Verify database connectivity",
      "Test third-party service availability",
      "Review recent code deployments",
      "Check server resource usage",
    ],
    example: "Database query throws unexpected error",
  },
  502: {
    name: "Bad Gateway",
    description: "Invalid response from upstream server",
    commonCauses: ["Upstream server down", "Network connectivity issues", "Load balancer misconfiguration"],
    troubleshooting: [
      "Check upstream server status",
      "Verify network connectivity",
      "Review load balancer configuration",
      "Check DNS resolution",
    ],
    example: "API gateway cannot reach backend service",
  },
  503: {
    name: "Service Unavailable",
    description: "Server temporarily unavailable",
    commonCauses: ["Server maintenance", "Overloaded server", "Temporary outage"],
    troubleshooting: [
      "Check server status page",
      "Wait and retry request",
      "Implement circuit breaker pattern",
      "Scale server resources",
    ],
    example: "Server under maintenance or overloaded",
  },
  504: {
    name: "Gateway Timeout",
    description: "Upstream server timeout",
    commonCauses: ["Slow database queries", "Long-running operations", "Network latency issues"],
    troubleshooting: [
      "Optimize slow queries",
      "Increase timeout values",
      "Implement async processing",
      "Add request caching",
    ],
    example: "Database query takes longer than gateway timeout",
  },
}

export function getStatusInfo(statusCode: number) {
  const info = HTTP_STATUS_MANUAL[statusCode as keyof typeof HTTP_STATUS_MANUAL]

  if (!info) {
    return {
      name: "Unknown Status",
      description: `HTTP status code ${statusCode}`,
      commonCauses: ["Unknown or custom status code"],
      troubleshooting: ["Check API documentation for custom status codes"],
      example: "Custom application-specific status code",
    }
  }

  return info
}

export function printStatusCodeManual(statusCode?: number) {
  if (statusCode) {
    const info = getStatusInfo(statusCode)
    console.log(`\n📋 HTTP ${statusCode} - ${info.name}`)
    console.log(`📝 Description: ${info.description}`)
    console.log(`🔍 Common Causes:`)
    info.commonCauses.forEach((cause) => console.log(`   • ${cause}`))
    console.log(`🛠️  Troubleshooting:`)
    info.troubleshooting.forEach((step) => console.log(`   • ${step}`))
    console.log(`💡 Example: ${info.example}\n`)
  } else {
    console.log("\n📚 HTTP Status Code Manual")
    console.log("Available status codes with detailed information:")
    Object.entries(HTTP_STATUS_MANUAL).forEach(([code, info]) => {
      console.log(`   ${code} - ${info.name}: ${info.description}`)
    })
    console.log("\nUse printStatusCodeManual(statusCode) for detailed information\n")
  }
}
