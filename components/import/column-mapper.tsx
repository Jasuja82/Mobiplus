"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircleIcon, AlertCircleIcon, MapIcon } from "lucide-react"
import { importService } from "@/lib/import-service"
import type { CSVData, ColumnMapping, DatabaseField } from "@/types"
import { DATABASE_FIELDS } from "@/types"

interface ColumnMapperProps {
  csvData: CSVData
  onMappingComplete: (mapping: ColumnMapping) => void
}

export function ColumnMapper({ csvData, onMappingComplete }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [autoMapped, setAutoMapped] = useState(false)

  // Auto-map columns based on common patterns
  useEffect(() => {
    if (!autoMapped) {
      const autoMapping = importService.autoMapColumns(csvData.headers)

      setMapping(autoMapping)
      setAutoMapped(true)
    }
  }, [csvData.headers, autoMapped])

  const updateMapping = (csvColumn: string, dbField: string | null) => {
    setMapping((prev) => ({ ...prev, [csvColumn]: dbField }))
  }

  const getRequiredFieldsStatus = () => {
    const requiredFields = DATABASE_FIELDS.filter((field) => field.required)
    const mappedRequiredFields = requiredFields.filter((field) => Object.values(mapping).includes(field.id))
    return {
      total: requiredFields.length,
      mapped: mappedRequiredFields.length,
      missing: requiredFields.filter((field) => !Object.values(mapping).includes(field.id)),
    }
  }

  const handleComplete = () => {
    const status = getRequiredFieldsStatus()
    if (status.mapped === status.total) {
      onMappingComplete(mapping)
    }
  }

  const requiredStatus = getRequiredFieldsStatus()
  const isComplete = requiredStatus.mapped === requiredStatus.total

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            Column Mapping
          </CardTitle>
          <CardDescription>
            Map your CSV columns to database fields. Required fields must be mapped to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Alert */}
          <Alert className={isComplete ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}>
            {isComplete ? (
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircleIcon className="h-4 w-4" />
            )}
            <AlertDescription>
              {isComplete
                ? "All required fields are mapped. Ready to proceed."
                : `${requiredStatus.mapped}/${requiredStatus.total} required fields mapped. Missing: ${requiredStatus.missing.map((f) => f.label).join(", ")}`}
            </AlertDescription>
          </Alert>

          {/* Column Mapping Table */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div>CSV Column</div>
              <div>Database Field</div>
              <div>Sample Data</div>
            </div>

            {csvData.headers.map((header, index) => {
              const sampleData = csvData.rows
                .slice(0, 3)
                .map((row) => row[index])
                .join(", ")
              const mappedField = DATABASE_FIELDS.find((field) => field.id === mapping[header])

              return (
                <div key={header} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-2 border-b">
                  <div className="font-medium">
                    {header}
                    {mappedField?.required && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Required
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Select
                      value={mapping[header] || "-- No mapping --"}
                      onValueChange={(value) => updateMapping(header, value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-- No mapping --">-- No mapping --</SelectItem>
                        {DATABASE_FIELDS.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            <div className="flex items-center gap-2">
                              {field.label}
                              {field.required && (
                                <Badge variant="outline" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground truncate">{sampleData || "No data"}</div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <div className="text-sm text-muted-foreground">{csvData.rows.length} rows will be processed</div>
            <Button onClick={handleComplete} disabled={!isComplete}>
              Continue to Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
