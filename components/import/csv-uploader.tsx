"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { UploadIcon, FileIcon, AlertCircleIcon } from "lucide-react"
import { importService } from "@/lib/import-service"
import type { CSVData } from "@/types"

interface CSVUploaderProps {
  onFileUpload: (data: CSVData) => void
}

export function CSVUploader({ onFileUpload }: CSVUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const processCSV = useCallback(
    async (file: File) => {
      setIsProcessing(true)
      setError(null)

      try {
        const csvData = await importService.parseCSV(file)

        onFileUpload(csvData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process CSV file")
      } finally {
        setIsProcessing(false)
      }
    },
    [onFileUpload],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setUploadedFile(file)
        processCSV(file)
      }
    },
    [processCSV],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>Upload your fleet data CSV file. Supported formats: .csv (max 10MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FileIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the CSV file here...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drag & drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse files</p>
                </div>
              )}
              <Button variant="outline" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Choose File"}
              </Button>
            </div>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Badge variant={error ? "destructive" : "secondary"}>
                  {isProcessing ? "Processing..." : error ? "Error" : "Ready"}
                </Badge>
              </div>
            </div>
          )}

          {error && (
            <Alert className="mt-4">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Expected CSV Format</CardTitle>
          <CardDescription>Your CSV file should contain the following columns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Required Columns</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Vehicle Internal Number</li>
                  <li>• License Plate</li>
                  <li>• Refuel Date</li>
                  <li>• Liters</li>
                  <li>• Odometer Reading</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optional Columns</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Driver Name</li>
                  <li>• Department</li>
                  <li>• Location</li>
                  <li>• Cost per Liter</li>
                  <li>• Notes</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm font-mono">
              vehicle.internal_number,vehicle.license_plate,refuel.date,driver.name,refuel.liters,refuel.odometer_reading,location.name
              <br />
              01,AB-12-34,2024-01-15,João Silva,45.2,125000,Angra Centro
              <br />
              28,CD-56-78,2024-01-16,Maria Santos,52.1,89000,Posto Sul
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
