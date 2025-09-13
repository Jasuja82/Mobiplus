"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EyeIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react"

interface CSVData {
  headers: string[]
  rows: string[][]
  fileName: string
  fileSize: number
}

interface ColumnMapping {
  [csvColumn: string]: string | null
}

interface ValidationError {
  row: number
  column: string
  value: string
  error: string
}

interface DataPreviewProps {
  csvData: CSVData
  columnMapping: ColumnMapping
  onValidation: (errors: ValidationError[]) => void
}

export function DataPreview({ csvData, columnMapping, onValidation }: DataPreviewProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [previewRows, setPreviewRows] = useState(10)

  // Validation rules
  const validateRow = (row: string[], rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = []

    csvData.headers.forEach((header, colIndex) => {
      const dbField = columnMapping[header]
      const value = row[colIndex]

      if (!dbField) return

      // Required field validation
      if (dbField.includes("vehicle.internal_number") && (!value || value.trim() === "")) {
        errors.push({
          row: rowIndex,
          column: header,
          value,
          error: "Vehicle internal number is required",
        })
      }

      if (dbField.includes("vehicle.license_plate") && (!value || value.trim() === "")) {
        errors.push({
          row: rowIndex,
          column: header,
          value,
          error: "License plate is required",
        })
      }

      if (dbField.includes("refuel.date")) {
        if (!value || value.trim() === "") {
          errors.push({
            row: rowIndex,
            column: header,
            value,
            error: "Refuel date is required",
          })
        } else {
          // Basic date validation
          const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}\/\d{4}$/
          if (!dateRegex.test(value)) {
            errors.push({
              row: rowIndex,
              column: header,
              value,
              error: "Invalid date format. Use YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY",
            })
          }
        }
      }

      if (dbField.includes("refuel.liters")) {
        if (!value || value.trim() === "") {
          errors.push({
            row: rowIndex,
            column: header,
            value,
            error: "Liters is required",
          })
        } else {
          const liters = Number.parseFloat(value)
          if (isNaN(liters) || liters <= 0 || liters > 500) {
            errors.push({
              row: rowIndex,
              column: header,
              value,
              error: "Liters must be a number between 0 and 500",
            })
          }
        }
      }

      if (dbField.includes("refuel.odometer_reading")) {
        if (!value || value.trim() === "") {
          errors.push({
            row: rowIndex,
            column: header,
            value,
            error: "Odometer reading is required",
          })
        } else {
          const odometer = Number.parseInt(value)
          if (isNaN(odometer) || odometer < 0) {
            errors.push({
              row: rowIndex,
              column: header,
              value,
              error: "Odometer reading must be a positive number",
            })
          }
        }
      }
    })

    return errors
  }

  // Run validation
  useEffect(() => {
    setIsValidating(true)

    const allErrors: ValidationError[] = []
    csvData.rows.forEach((row, index) => {
      const rowErrors = validateRow(row, index + 1) // +1 for 1-based row numbering
      allErrors.push(...rowErrors)
    })

    setValidationErrors(allErrors)
    onValidation(allErrors)
    setIsValidating(false)
  }, [csvData, columnMapping, onValidation])

  const getRowErrors = (rowIndex: number) => {
    return validationErrors.filter((error) => error.row === rowIndex + 1)
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
                        const cellErrors = rowErrors.filter((error) => error.column === header)

                        return (
                          <TableCell key={header} className={cellErrors.length > 0 ? "text-red-600" : ""}>
                            <div>
                              <div>{cellValue || "-"}</div>
                              {cellErrors.map((error, errorIndex) => (
                                <div key={errorIndex} className="text-xs text-red-500 mt-1">
                                  {error.error}
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
            <Button variant="outline" onClick={() => (window.location.href = "/import?step=1")}>
              Back to Mapping
            </Button>
            <Button disabled={isValidating} onClick={() => (window.location.href = "/import?step=3")}>
              Continue to Import
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
