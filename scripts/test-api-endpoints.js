// API Endpoint Testing Script for MobiAzores Fleet Management
// This script tests all API endpoints to ensure they're working correctly

const BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000"

console.log(`[v0] Testing API endpoints at: ${BASE_URL}`)

// Test helper function
async function testEndpoint(method, endpoint, body = null, expectedStatus = 200) {
  try {
    console.log(`[v0] Testing ${method} ${endpoint}`)

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()

    const status = response.status === expectedStatus ? "✅" : "❌"
    console.log(`[v0] ${status} ${method} ${endpoint} - Status: ${response.status}`)

    if (response.status !== expectedStatus) {
      console.log(`[v0] Expected: ${expectedStatus}, Got: ${response.status}`)
      console.log(`[v0] Response:`, data)
    }

    return { success: response.status === expectedStatus, data, status: response.status }
  } catch (error) {
    console.log(`[v0] ❌ ${method} ${endpoint} - Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Main test function
async function runAPITests() {
  console.log("[v0] Starting comprehensive API endpoint testing...\n")

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Test Admin Endpoints
  console.log("[v0] === TESTING ADMIN ENDPOINTS ===")

  const adminTests = [
    ["GET", "/api/admin/system-stats"],
    ["GET", "/api/admin/audit-logs"],
    ["GET", "/api/admin/audit-logs?action=CREATE&limit=10"],
    ["GET", "/api/admin/users"],
    ["POST", "/api/admin/backup"],
  ]

  for (const [method, endpoint, body] of adminTests) {
    const result = await testEndpoint(method, endpoint, body)
    results.tests.push({ method, endpoint, ...result })
    result.success ? results.passed++ : results.failed++
  }

  // Test Analytics Endpoint
  console.log("\n[v0] === TESTING ANALYTICS ENDPOINTS ===")

  const analyticsTests = [
    ["GET", "/api/analytics"],
    ["GET", "/api/analytics?department_id=1&date_from=2024-01-01&date_to=2024-12-31"],
  ]

  for (const [method, endpoint, body] of analyticsTests) {
    const result = await testEndpoint(method, endpoint, body)
    results.tests.push({ method, endpoint, ...result })
    result.success ? results.passed++ : results.failed++
  }

  // Test Refuel Records Endpoints
  console.log("\n[v0] === TESTING REFUEL RECORDS ENDPOINTS ===")

  const refuelTests = [
    ["GET", "/api/refuel-records"],
    ["GET", "/api/refuel-records?vehicle_id=1&limit=5"],
  ]

  for (const [method, endpoint, body] of refuelTests) {
    const result = await testEndpoint(method, endpoint, body)
    results.tests.push({ method, endpoint, ...result })
    result.success ? results.passed++ : results.failed++
  }

  // Test Vehicles Endpoints (Note: These require auth, so they might fail)
  console.log("\n[v0] === TESTING VEHICLES ENDPOINTS ===")

  const vehicleTests = [
    ["GET", "/api/vehicles"],
    ["GET", "/api/vehicles?department_id=1"],
    ["GET", "/api/vehicles/1"],
  ]

  for (const [method, endpoint, body] of vehicleTests) {
    const result = await testEndpoint(method, endpoint, body, method === "GET" ? 401 : 200) // Expect 401 for auth-protected routes
    results.tests.push({ method, endpoint, ...result })
    result.success ? results.passed++ : results.failed++
  }

  // Test Summary
  console.log("\n[v0] === TEST SUMMARY ===")
  console.log(`[v0] Total Tests: ${results.tests.length}`)
  console.log(`[v0] Passed: ${results.passed}`)
  console.log(`[v0] Failed: ${results.failed}`)
  console.log(`[v0] Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`)

  // Detailed Results
  console.log("\n[v0] === DETAILED RESULTS ===")
  results.tests.forEach((test) => {
    const status = test.success ? "✅" : "❌"
    console.log(`[v0] ${status} ${test.method} ${test.endpoint} (${test.status || "Error"})`)
    if (!test.success && test.error) {
      console.log(`[v0]    Error: ${test.error}`)
    }
  })

  return results
}

// Run the tests
runAPITests().catch(console.error)
