import { NextRequest, NextResponse } from "next/server"
import { importService } from "@/lib/import-service"
import type { ColumnMapping } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const columnMappingStr = formData.get('columnMapping') as string

    if (!file) {
      return NextResponse.json({ error: "No file provided", success: false }, { status: 400 })
    }

    if (!columnMappingStr) {
      return NextResponse.json({ error: "No column mapping provided", success: false }, { status: 400 })
    }

    const columnMapping: ColumnMapping = JSON.parse(columnMappingStr)

    // Parse CSV
    const csvData = await importService.parseCSV(file)
    
    // Validate data
    const { records } = await importService.validateData(csvData, columnMapping)
    
    // Import records
    const result = await importService.importRecords(records, columnMapping)

    return NextResponse.json({ data: result, success: true })
  } catch (error) {
    console.error("CSV import error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Import failed", 
        success: false 
      }, 
      { status: 500 }
    )
  }
}
