"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logger, type ApiResponse } from "@/lib/debug/logger"
import { printStatusCodeManual } from "@/lib/debug/status-codes"

export function DebugPanel() {
  const [logs, setLogs] = useState<ApiResponse[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(logger.getLogs())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true
    if (filter === "errors") return log.status >= 400
    if (filter === "success") return log.status >= 200 && log.status < 300
    if (filter === "slow") return log.duration && log.duration > 1000
    return true
  })

  const getStatusBadgeVariant = (status: number) => {
    if (status >= 200 && status < 300) return "default"
    if (status >= 300 && status < 400) return "secondary"
    if (status >= 400 && status < 500) return "destructive"
    if (status >= 500) return "destructive"
    return "outline"
  }

  if (!isVisible) {
    return (
      <Button onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 z-50" variant="outline" size="sm">
        🐛 Debug
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug Panel</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  logger.clearLogs()
                  setLogs([])
                }}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
              <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-4 mb-2">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="errors" className="text-xs">
                Errors
              </TabsTrigger>
              <TabsTrigger value="success" className="text-xs">
                Success
              </TabsTrigger>
              <TabsTrigger value="slow" className="text-xs">
                Slow
              </TabsTrigger>
            </TabsList>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredLogs
                .slice(-10)
                .reverse()
                .map((log, index) => (
                  <div key={index} className="text-xs border rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(log.context.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-mono text-xs mb-1">
                      {log.context.method} {log.context.path}
                    </div>
                    <div className="text-muted-foreground mb-1">{log.message}</div>
                    {log.duration && <div className="text-muted-foreground">Duration: {log.duration}ms</div>}
                    {log.error && (
                      <div className="text-red-500 text-xs mt-1">
                        Error: {log.error.message || JSON.stringify(log.error)}
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        console.log("📋 Detailed Status Information:")
                        printStatusCodeManual(log.status)
                        console.log("📊 Full Log Entry:", log)
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 mt-1 text-xs"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              {filteredLogs.length === 0 && <div className="text-center text-muted-foreground py-4">No logs found</div>}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
