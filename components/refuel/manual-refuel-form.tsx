"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Calculator, Save } from "lucide-react"
import { validationEngine } from "@/lib/validation-engine"

interface ManualRefuelFormProps {
  selectedVehicle: string
  onVehicleChange: (vehicleId: string) => void
  lastOdometer: number
  avgEfficiency: number
  lastRefuelDate: string
}

export function ManualRefuelForm({
  selectedVehicle,
  onVehicleChange,
  lastOdometer,
  avgEfficiency,
  lastRefuelDate,
}: ManualRefuelFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    odometer: "",
    liters: "",
    cost_per_liter: "1.451", // Default price per liter for Azores
    location: "",
    driver_id: "",
    notes: "",
  })

  const [validationFlags, setValidationFlags] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculatedEfficiency, setCalculatedEfficiency] = useState<number>(0)

  useEffect(() => {
    if (selectedVehicle && formData.odometer && formData.liters) {
      const record = {
        vehicle_id: selectedVehicle,
        odometer: Number.parseInt(formData.odometer),
        liters: Number.parseFloat(formData.liters),
        date: formData.date,
      }

      const context = {
        lastOdometer,
        avgEfficiency,
        lastRefuelDate,
      }

      validationEngine.updateVehicleStats(selectedVehicle, context)
      const flags = validationEngine.validateRecord(record, selectedVehicle)
      setValidationFlags(flags)

      // Calculate current efficiency
      if (lastOdometer > 0 && record.odometer > lastOdometer) {
        const kmDriven = record.odometer - lastOdometer
        const efficiency = (Number.parseFloat(formData.liters) / kmDriven) * 100
        setCalculatedEfficiency(efficiency)
      }
    }
  }, [formData, selectedVehicle, lastOdometer, avgEfficiency])

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validationFlags.some((flag) => flag.severity === "error")) {
      alert("Please resolve all errors before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/refuel-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: selectedVehicle,
          refuel_date: formData.date,
          odometer_reading: Number.parseInt(formData.odometer),
          liters: Number.parseFloat(formData.liters),
          cost_per_liter: Number.parseFloat(formData.cost_per_liter), // Use correct column name
          total_cost: Number.parseFloat(totalCost), // Use calculated total cost
          location_id: formData.location,
          driver_id: formData.driver_id || null,
          distance_since_last: kmDriven > 0 ? kmDriven : null, // Add distance calculation
          notes: formData.notes || null,
        }),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          date: new Date().toISOString().split("T")[0],
          odometer: "",
          liters: "",
          cost_per_liter: "1.451",
          location: "",
          driver_id: "",
          notes: "",
        })
        setValidationFlags([])
        alert("Refuel record saved successfully!")
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error saving refuel record:", error)
      alert("Error saving refuel record")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isHistoricalEntry = formData.date < new Date().toISOString().split("T")[0]

  const totalCost =
    formData.liters && formData.cost_per_liter
      ? (Number.parseFloat(formData.liters) * Number.parseFloat(formData.cost_per_liter)).toFixed(2)
      : "0.00"

  const kmDriven = formData.odometer && lastOdometer > 0 ? Number.parseInt(formData.odometer) - lastOdometer : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Refuel Entry Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedVehicle && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Vehicle {selectedVehicle}</span>
                <Badge variant="outline">Last: {lastOdometer} km</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Last refuel: {lastRefuelDate || "No previous records"} | Avg efficiency: {avgEfficiency.toFixed(2)}{" "}
                L/100km
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                required
              />
              {isHistoricalEntry && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Historical entry - ensure odometer value is correct for this date</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="odometer">Odometer (km)</Label>
              <Input
                id="odometer"
                type="number"
                value={formData.odometer}
                onChange={(e) => handleFieldChange("odometer", e.target.value)}
                placeholder={`Last: ${lastOdometer} km`}
                required
              />
              {kmDriven > 0 && <div className="text-sm text-muted-foreground mt-1">Distance driven: {kmDriven} km</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="liters">Liters *</Label>
              <Input
                id="liters"
                type="number"
                step="0.01"
                value={formData.liters}
                onChange={(e) => handleFieldChange("liters", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="cost_per_liter">Price per Liter (€) *</Label>
              <Input
                id="cost_per_liter"
                type="number"
                step="0.001"
                value={formData.cost_per_liter}
                onChange={(e) => handleFieldChange("cost_per_liter", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Total Cost (€)</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted text-muted-foreground">
                <span className="text-sm font-medium">€{totalCost}</span>
              </div>
            </div>

            <div>
              <Label>Efficiency</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                <Calculator className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {calculatedEfficiency > 0 ? `${calculatedEfficiency.toFixed(2)} L/100km` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Fuel Station</Label>
              <Select value={formData.location} onValueChange={(value) => handleFieldChange("location", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="galp-ponta-delgada">Galp - Ponta Delgada</SelectItem>
                  <SelectItem value="bp-ribeira-grande">BP - Ribeira Grande</SelectItem>
                  <SelectItem value="repsol-lagoa">Repsol - Lagoa</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="driver">Driver</Label>
              <Select value={formData.driver_id} onValueChange={(value) => handleFieldChange("driver_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver-1">João Silva</SelectItem>
                  <SelectItem value="driver-2">Maria Santos</SelectItem>
                  <SelectItem value="driver-3">António Costa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Additional notes about this refuel..."
              rows={3}
            />
          </div>

          {validationFlags.length > 0 && (
            <div className="space-y-2">
              {validationFlags.map((flag, index) => (
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || validationFlags.some((flag) => flag.severity === "error")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Saving..." : "Save Refuel Record"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
