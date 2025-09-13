"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { AlertTriangle, CheckCircle, XCircle, Edit3, ArrowUpDown } from "lucide-react"

interface RefuelRecord {
  id: string
  vehicle_id: string
  date: string
  odometer: number
  liters: number
  cost: number
  location: string
  driver_id: string
  flags: ValidationFlag[]
  edited?: boolean
}

interface ValidationFlag {
  type: "odometer_jump" | "same_day_order" | "negative_km" | "fuel_anomaly"
  severity: "error" | "warning"
  message: string
  suggestion?: string
}

interface VehicleStats {
  vehicle_id: string
  last_odometer: number
  avg_fuel_efficiency: number
  last_refuel_date: string
}

export default function EnhancedValidator() {
  const [records, setRecords] = useState<RefuelRecord[]>([])
  const [vehicleStats, setVehicleStats] = useState<VehicleStats[]>([])
  const [editingRecord, setEditingRecord] = useState<string | null>(null)
  const [validationComplete, setValidationComplete] = useState(false)

  const validateRecords = (importedRecords: RefuelRecord[]) => {
    const validatedRecords = importedRecords.map((record) => {
      const flags: ValidationFlag[] = []
      const vehicleStat = vehicleStats.find((v) => v.vehicle_id === record.vehicle_id)

      // Check odometer jump (>3000km difference)
      if (vehicleStat && record.odometer - vehicleStat.last_odometer > 3000) {
        flags.push({
          type: "odometer_jump",
          severity: "warning",
          message: `Large odometer jump: ${record.odometer - vehicleStat.last_odometer}km`,
          suggestion: "Verify odometer reading or check for missing refuel records",
        })
      }

      // Check for negative km progression
      if (vehicleStat && record.odometer < vehicleStat.last_odometer) {
        flags.push({
          type: "negative_km",
          severity: "error",
          message: "Odometer reading is lower than previous record",
          suggestion: "Correct odometer value or check date sequence",
        })
      }

      // Check fuel efficiency anomaly
      if (vehicleStat && vehicleStat.avg_fuel_efficiency > 0) {
        const kmDriven = record.odometer - vehicleStat.last_odometer
        const currentEfficiency = kmDriven / record.liters
        const efficiencyDiff = Math.abs(currentEfficiency - vehicleStat.avg_fuel_efficiency)

        if (efficiencyDiff > vehicleStat.avg_fuel_efficiency * 0.5) {
          flags.push({
            type: "fuel_anomaly",
            severity: "warning",
            message: `Unusual fuel efficiency: ${currentEfficiency.toFixed(2)} L/100km vs avg ${vehicleStat.avg_fuel_efficiency.toFixed(2)}`,
            suggestion: "Verify fuel amount and odometer reading",
          })
        }
      }

      return { ...record, flags }
    })

    const sameDayGroups = validatedRecords.reduce(
      (groups, record) => {
        const key = `${record.vehicle_id}-${record.date}`
        if (!groups[key]) groups[key] = []
        groups[key].push(record)
        return groups
      },
      {} as Record<string, RefuelRecord[]>,
    )

    Object.values(sameDayGroups).forEach((group) => {
      if (group.length > 1) {
        // Sort by odometer to check progression
        const sorted = [...group].sort((a, b) => a.odometer - b.odometer)
        group.forEach((record, index) => {
          if (record.odometer !== sorted[index].odometer) {
            record.flags.push({
              type: "same_day_order",
              severity: "warning",
              message: "Multiple refuels on same day - check ordering",
              suggestion: "Ensure odometer progression is positive",
            })
          }
        })
      }
    })

    setRecords(validatedRecords)
    setValidationComplete(true)
  }

  const updateRecord = (recordId: string, field: string, value: any) => {
    setRecords((prev) =>
      prev.map((record) => {
        if (record.id === recordId) {
          const updated = { ...record, [field]: value, edited: true }
          // Re-validate this record
          const flags: ValidationFlag[] = []
          const vehicleStat = vehicleStats.find((v) => v.vehicle_id === updated.vehicle_id)

          if (field === "odometer" && vehicleStat) {
            if (value - vehicleStat.last_odometer > 3000) {
              flags.push({
                type: "odometer_jump",
                severity: "warning",
                message: `Large odometer jump: ${value - vehicleStat.last_odometer}km`,
              })
            }
            if (value < vehicleStat.last_odometer) {
              flags.push({
                type: "negative_km",
                severity: "error",
                message: "Odometer reading is lower than previous record",
              })
            }
          }

          return { ...updated, flags }
        }
        return record
      }),
    )
  }

  const autoSortSameDayRefuels = (vehicleId: string, date: string) => {
    setRecords((prev) => {
      const sameDayRecords = prev.filter((r) => r.vehicle_id === vehicleId && r.date === date)
      const otherRecords = prev.filter((r) => !(r.vehicle_id === vehicleId && r.date === date))
      const sortedSameDay = sameDayRecords.sort((a, b) => a.odometer - b.odometer)

      return [...otherRecords, ...sortedSameDay]
    })
  }

  const getValidationSummary = () => {
    const totalRecords = records.length
    const recordsWithErrors = records.filter((r) => r.flags.some((f) => f.severity === "error")).length
    const recordsWithWarnings = records.filter((r) => r.flags.some((f) => f.severity === "warning")).length
    const cleanRecords = totalRecords - recordsWithErrors - recordsWithWarnings

    return { totalRecords, recordsWithErrors, recordsWithWarnings, cleanRecords }
  }

  const summary = getValidationSummary()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Validation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalRecords}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.recordsWithErrors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.recordsWithWarnings}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.cleanRecords}</div>
              <div className="text-sm text-muted-foreground">Clean</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Records Validation & Editing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Vehicle {record.vehicle_id}</span>
                    <span className="text-sm text-muted-foreground">{record.date}</span>
                    {record.edited && <Badge variant="secondary">Edited</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {record.flags.length === 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRecord(editingRecord === record.id ? null : record.id)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {record.flags.length > 0 && (
                  <div className="space-y-2">
                    {record.flags.map((flag, index) => (
                      <Alert key={index} variant={flag.severity === "error" ? "destructive" : "default"}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">{flag.message}</div>
                          {flag.suggestion && <div className="text-sm mt-1 opacity-80">{flag.suggestion}</div>}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {editingRecord === record.id && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <label className="text-sm font-medium">Odometer</label>
                      <Input
                        type="number"
                        value={record.odometer}
                        onChange={(e) => updateRecord(record.id, "odometer", Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Liters</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={record.liters}
                        onChange={(e) => updateRecord(record.id, "liters", Number.parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cost</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={record.cost}
                        onChange={(e) => updateRecord(record.id, "cost", Number.parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        value={record.location}
                        onChange={(e) => updateRecord(record.id, "location", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {record.flags.some((f) => f.type === "same_day_order") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => autoSortSameDayRefuels(record.vehicle_id, record.date)}
                    className="flex items-center gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    Auto-sort same day refuels
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setValidationComplete(false)}>
          Re-validate All
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Export Errors</Button>
          <Button disabled={summary.recordsWithErrors > 0} className="bg-green-600 hover:bg-green-700">
            Import {summary.cleanRecords + summary.recordsWithWarnings} Records
          </Button>
        </div>
      </div>
    </div>
  )
}
