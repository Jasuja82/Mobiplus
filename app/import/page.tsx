"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UploadIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import { CSVUploader } from "@/components/import/csv-uploader"
import { ColumnMapper } from "@/components/import/column-mapper"
import { DataPreview } from "@/components/import/data-preview"
import { ImportResults } from "@/components/import/import-results"

interface ImportStep {
  id: string
  title: string
  description: string
  status: "pending" | "active" | "completed" | "error"
}

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

export default function ImportPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [csvData, setCsvData] = useState<CSVData | null>(null)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState<any>(null)

  const steps: ImportStep[] = [
    {
      id: "upload",
      title: "Upload CSV File",
      description: "Select and upload your CSV file",
      status: currentStep === 0 ? "active" : currentStep > 0 ? "completed" : "pending",
    },
    {
      id: "mapping",
      title: "Map Columns",
      description: "Map CSV columns to database fields",
      status: currentStep === 1 ? "active" : currentStep > 1 ? "completed" : "pending",
    },
    {
      id: "preview",
      title: "Preview & Validate",
      description: "Review data and fix validation errors",
      status: currentStep === 2 ? "active" : currentStep > 2 ? "completed" : "pending",
    },
    {
      id: "import",
      title: "Import Data",
      description: "Import validated data to database",
      status: currentStep === 3 ? "active" : currentStep > 3 ? "completed" : "pending",
    },
  ]

  const handleFileUpload = (data: CSVData) => {
    setCsvData(data)
    setCurrentStep(1)
  }

  const handleColumnMapping = (mapping: ColumnMapping) => {
    setColumnMapping(mapping)
    setCurrentStep(2)
  }

  const handleValidation = (errors: ValidationError[]) => {
    setValidationErrors(errors)
    setCurrentStep(3)
  }

  const handleImport = async () => {
    if (!csvData || !columnMapping) return

    setImportProgress(0)

    try {
      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Mock import results
      const results = {
        totalRows: csvData.rows.length,
        successfulImports: csvData.rows.length - validationErrors.length,
        errors: validationErrors.length,
        warnings: 2,
        duration: "2.3s",
        createdRecords: {
          vehicles: 15,
          drivers: 8,
          refuelRecords: 45,
          locations: 3,
        },
      }

      setImportResults(results)
      setCurrentStep(4)
    } catch (error) {
      console.error("Import failed:", error)
    }
  }

  const resetImport = () => {
    setCurrentStep(0)
    setCsvData(null)
    setColumnMapping({})
    setValidationErrors([])
    setImportProgress(0)
    setImportResults(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">CSV Data Import</h1>
            <p className="text-muted-foreground">Import fleet data from CSV files with validation and mapping</p>
          </div>
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={resetImport}
              className="hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              Start New Import
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Import Progress</CardTitle>
            <CardDescription>Follow these steps to import your CSV data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:flex md:items-center md:justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      step.status === "completed"
                        ? "border-green-500 bg-green-500 text-white"
                        : step.status === "active"
                          ? "border-primary bg-primary text-primary-foreground"
                          : step.status === "error"
                            ? "border-destructive bg-destructive text-destructive-foreground"
                            : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : step.status === "error" ? (
                      <AlertCircleIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden md:block h-0.5 w-16 transition-colors ${
                        step.status === "completed" ? "bg-green-500" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Import Content */}
        <div className="space-y-6">
          {currentStep === 0 && <CSVUploader onFileUpload={handleFileUpload} />}

          {currentStep === 1 && csvData && <ColumnMapper csvData={csvData} onMappingComplete={handleColumnMapping} />}

          {currentStep === 2 && csvData && (
            <DataPreview csvData={csvData} columnMapping={columnMapping} onValidation={handleValidation} />
          )}

          {currentStep === 3 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <UploadIcon className="h-5 w-5" />
                  Import Data
                </CardTitle>
                <CardDescription>
                  Ready to import {csvData?.rows.length} rows with {validationErrors.length} validation errors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationErrors.length > 0 && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <AlertCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      There are {validationErrors.length} validation errors. Rows with errors will be skipped during
                      import.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-foreground">
                    <span>Import Progress</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleImport}
                    disabled={importProgress > 0 && importProgress < 100}
                    className="hover:bg-primary/90"
                  >
                    {importProgress > 0 && importProgress < 100 ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Importing...
                      </div>
                    ) : (
                      "Start Import"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    Back to Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && importResults && <ImportResults results={importResults} onNewImport={resetImport} />}
        </div>
      </div>
    </div>
  )
}
