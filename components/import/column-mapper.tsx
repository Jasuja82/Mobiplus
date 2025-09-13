"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircleIcon, AlertCircleIcon, MapIcon } from "lucide-react"

interface CSVData {
  headers: string[]
  rows: string[][]
  fileName: string
  fileSize: number
}

interface ColumnMapping {
  [csvColumn: string]: string | null
}

interface ColumnMapperProps {
  csvData: CSVData
  onMappingComplete: (mapping: ColumnMapping) => void
}

const DATABASE_FIELDS = [
  { id: "vehicle.internal_number", label: "Vehicle Internal Number", required: true, type: "string" },
  { id: "vehicle.license_plate", label: "License Plate", required: true, type: "string" },
  { id: "refuel.date", label: "Refuel Date", required: true, type: "date" },
  { id: "refuel.liters", label: "Liters", required: true, type: "number" },
  { id: "refuel.odometer_reading", label: "Odometer Reading", required: true, type: "number" },
  { id: "driver.name", label: "Driver Name", required: false, type: "string" },
  { id: "department.name", label: "Department", required: false, type: "string" },
  { id: "location.name", label: "Location", required: false, type: "string" },
  { id: "refuel.cost_per_liter", label: "Cost per Liter", required: false, type: "number" },
  { id: "refuel.notes", label: "Notes", required: false, type: "string" },
]

export function ColumnMapper({ csvData, onMappingComplete }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [autoMapped, setAutoMapped] = useState(false)

  // Auto-map columns based on common patterns
  useEffect(() => {
    if (!autoMapped) {
      const autoMapping: ColumnMapping = {}

      csvData.headers.forEach((header) => {
        const lowerHeader = header.toLowerCase()

        // Auto-mapping patterns
        if (lowerHeader.includes("interno") || lowerHeader.includes("internal")) {
          autoMapping[header] = "vehicle.internal_number"
        } else if (lowerHeader.includes("matrícula") || lowerHeader.includes("plate")) {
          autoMapping[header] = "vehicle.license_plate"
        } else if (lowerHeader.includes("data") || lowerHeader.includes("date")) {
          autoMapping[header] = "refuel.date"
        } else if (lowerHeader.includes("litros") || lowerHeader.includes("liters")) {
          autoMapping[header] = "refuel.liters"
        } else if (lowerHeader.includes("km") || lowerHeader.includes("odometer")) {
          autoMapping[header] = "refuel.odometer_reading"
        } else if (lowerHeader.includes("condutor") || lowerHeader.includes("driver")) {
          autoMapping[header] = "driver.name"
        } else if (lowerHeader.includes("departamento") || lowerHeader.includes("department")) {
          autoMapping[header] = "department.name"
        } else if (lowerHeader.includes("local") || lowerHeader.includes("location")) {
          autoMapping[header] = "location.name"
        } else if (lowerHeader.includes("preço") || lowerHeader.includes("price") || lowerHeader.includes("cost")) {
          autoMapping[header] = "refuel.cost_per_liter"
        } else if (lowerHeader.includes("notas") || lowerHeader.includes("notes")) {
          autoMapping[header] = "refuel.notes"
        }
      })

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
