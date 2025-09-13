"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, DownloadIcon } from "lucide-react"
import type { ImportResult } from "@/types"

interface ImportResultsProps {
  results: ImportResult
  onNewImport: () => void
}

export function ImportResults({ results, onNewImport }: ImportResultsProps) {
  const successRate = (results.successfulImports / results.totalRows) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            Import Completed
          </CardTitle>
          <CardDescription>Your CSV data has been processed and imported into the database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.successfulImports}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{results.errors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{results.warnings}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {/* Status Alerts */}
          <div className="space-y-3">
            {results.successfulImports > 0 && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Successfully imported {results.successfulImports} out of {results.totalRows} rows in{" "}
                  {results.duration}.
                </AlertDescription>
              </Alert>
            )}

            {results.errors > 0 && (
              <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  {results.errors} rows were skipped due to validation errors. Check the error log for details.
                </AlertDescription>
              </Alert>
            )}

            {results.warnings > 0 && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  {results.warnings} rows imported with warnings. Data may need review.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Created Records Breakdown */}
          <div>
            <h4 className="font-medium mb-3">Records Created</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(results.createdRecords).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm capitalize">{type.replace(/([A-Z])/g, " $1").trim()}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onNewImport} className="flex-1">
              Import Another File
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" asChild>
              <a href="/refuel">
              View Imported Data
              </a>
            </Button>
          </div>

          {/* Import Details */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Rows Processed:</span>
                <span className="ml-2 font-medium">{results.totalRows}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Processing Time:</span>
                <span className="ml-2 font-medium">{results.duration}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Import Date:</span>
                <span className="ml-2 font-medium">{new Date().toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={results.errors === 0 ? "default" : "secondary"} className="ml-2">
                  {results.errors === 0 ? "Complete" : "Partial"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
