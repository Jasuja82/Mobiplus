"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, CheckCircle, XCircle, Clock } from "lucide-react"

interface TestResult {
  method: string
  endpoint: string
  status: number
  success: boolean
  data?: any
  error?: string
  duration?: number
}

export function APITestPanel() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState({ passed: 0, failed: 0, total: 0 })

  const testEndpoint = async (method: string, endpoint: string, body?: any): Promise<TestResult> => {
    const startTime = Date.now()

    try {
      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()
      const duration = Date.now() - startTime

      return {
        method,
        endpoint,
        status: response.status,
        success: response.ok,
        data,
        duration,
      }
    } catch (error) {
      return {
        method,
        endpoint,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
      }
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([])

    const testCases = [
      // Admin endpoints
      { method: "GET", endpoint: "/api/admin/system-stats" },
      { method: "GET", endpoint: "/api/admin/audit-logs" },
      { method: "GET", endpoint: "/api/admin/users" },
      { method: "POST", endpoint: "/api/admin/backup" },

      // Analytics
      { method: "GET", endpoint: "/api/analytics" },

      // Refuel records
      { method: "GET", endpoint: "/api/refuel-records" },

      // Vehicles (will likely fail due to auth)
      { method: "GET", endpoint: "/api/vehicles" },
      { method: "GET", endpoint: "/api/vehicles/1" },
    ]

    const testResults: TestResult[] = []

    for (const testCase of testCases) {
      const result = await testEndpoint(testCase.method, testCase.endpoint)
      testResults.push(result)
      setResults([...testResults]) // Update UI progressively
    }

    const passed = testResults.filter((r) => r.success).length
    const failed = testResults.filter((r) => !r.success).length

    setSummary({ passed, failed, total: testResults.length })
    setTesting(false)
  }

  const getStatusIcon = (result: TestResult) => {
    if (result.success) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (result: TestResult) => {
    if (result.success) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Success
        </Badge>
      )
    }
    return <Badge variant="destructive">Failed</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          API Endpoint Testing
        </CardTitle>
        <CardDescription>Test all API endpoints to ensure they're working correctly</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button onClick={runAllTests} disabled={testing} className="flex items-center gap-2">
              {testing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>

            {summary.total > 0 && (
              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {summary.passed} Passed
                </Badge>
                <Badge variant="destructive">{summary.failed} Failed</Badge>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <Tabs defaultValue="results" className="w-full">
              <TabsList>
                <TabsTrigger value="results">Test Results</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="results">
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result)}
                            <span className="font-mono text-sm">
                              {result.method} {result.endpoint}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(result)}
                            <Badge variant="outline">{result.status || "Error"}</Badge>
                            {result.duration && <Badge variant="outline">{result.duration}ms</Badge>}
                          </div>
                        </div>
                        {result.error && <div className="mt-2 text-sm text-red-600">Error: {result.error}</div>}
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="summary">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold">{summary.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </Card>
                </div>

                {summary.total > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">Success Rate</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(summary.passed / summary.total) * 100}%` }}
                      />
                    </div>
                    <div className="text-center mt-1 text-sm font-medium">
                      {((summary.passed / summary.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
