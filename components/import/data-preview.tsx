"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EyeIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react"
import { importService } from "@/lib/import-service"
import type { CSVData, ColumnMapping, ValidationFlag } from "@/types"

interface DataPreviewProps {
  csvData: CSVData
  columnMapping: ColumnMapping
  onValidation: (errors: ValidationFlag[]) => void
}

export function DataPreview({ csvData, columnMapping, onValidation }: DataPreviewProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationFlag[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [previewRows, setPreviewRows] = useState(10)

  // Run validation
  useEffect(() => {
    const runValidation = async () => {
      setIsValidating(true)

      try {
        const { errors } = await importService.validateData(csvData, columnMapping)
        setValidationErrors(errors)
        onValidation(errors)
      } catch (error) {
        console.error("Validation error:", error)
        setValidationErrors([])
        onValidation([])
      } finally {
        setIsValidating(false)
      }
    }

    runValidation()
  }, [csvData, columnMapping, onValidation])

  const getRowErrors = (rowIndex: number) => {
    return validationErrors.filter((error) => error.type.includes(`row_${rowIndex + 1}`))
  }

  const getMappedHeaders = () => {
    return csvData.headers.filter((header) => columnMapping[header])
  }

  const mappedHeaders = getMappedHeaders()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5" />
            Data Preview & Validation
          </CardTitle>
          <CardDescription>Review your data and validation results before importing</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Validation Summary */}
          <Alert className={validationErrors.length === 0 ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}>
            {validationErrors.length === 0 ? (
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircleIcon className="h-4 w-4" />
            )}
            <AlertDescription>
              {isValidating
                ? "Validating data..."
                : validationErrors.length === 0
                  ? `All ${csvData.rows.length} rows passed validation. Ready to import.`
                  : `Found ${validationErrors.length} validation errors in ${new Set(validationErrors.map((e) => e.row)).size} rows. Rows with errors will be skipped.`}
            </AlertDescription>
          </Alert>

          {/* Preview Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Show rows:</span>
              <select
                value={previewRows}
                onChange={(e) => setPreviewRows(Number.parseInt(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <Badge variant="secondary">{csvData.rows.length} total rows</Badge>
          </div>

          {/* Data Table */}
          <div className="mt-4 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  {mappedHeaders.map((header) => (
                    <TableHead key={header}>
                      <div className="space-y-1">
                        <div className="font-medium">{header}</div>
                        <div className="text-xs text-muted-foreground">{columnMapping[header]?.split(".").pop()}</div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.rows.slice(0, previewRows).map((row, rowIndex) => {
                  const rowErrors = getRowErrors(rowIndex)
                  const hasErrors = rowErrors.length > 0

                  return (
                    <TableRow key={rowIndex} className={hasErrors ? "bg-red-50 dark:bg-red-950" : ""}>
                      <TableCell className="font-medium">{rowIndex + 1}</TableCell>
                      {mappedHeaders.map((header, colIndex) => {
                        const originalColIndex = csvData.headers.indexOf(header)
                        const cellValue = row[originalColIndex]
                        const cellErrors = rowErrors.filter((error) => error.message.includes(header))

                        return (
                          <TableCell key={header} className={cellErrors.length > 0 ? "text-red-600" : ""}>
                            <div>
                              <div>{cellValue || "-"}</div>
                              {cellErrors.map((error, errorIndex) => (
                                <div key={errorIndex} className="text-xs text-red-500 mt-1">
                                  {error.message}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        )
                      })}
                      <TableCell>
                        {hasErrors ? (
                          <Badge variant="destructive" className="text-xs">
                            {rowErrors.length} error{rowErrors.length > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Valid
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Mapping
            </Button>
            <Button 
              disabled={isValidating || validationErrors.filter(e => e.severity === "error").length > 0}
              onClick={() => onValidation(validationErrors)}
            >
              Continue to Import
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
