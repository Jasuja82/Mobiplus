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
import { useSettings } from "@/contexts/SettingsContext"
import { useTranslation } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"

interface ManualRefuelFormProps {
  selectedVehicle: string
  onVehicleChange: (vehicleId: string) => void
  lastOdometer: number
  avgEfficiency: number
  lastRefuelDate: string
}

interface FuelStation {
  id: string
  name: string
  brand: string
  address: string
  is_active: boolean
}

interface Driver {
  id: string
  name: string
  internal_number: string
  is_active: boolean
}

export function ManualRefuelForm({
  selectedVehicle,
  onVehicleChange,
  lastOdometer,
  avgEfficiency,
  lastRefuelDate,
}: ManualRefuelFormProps) {
  const { settings } = useSettings()
  const { t } = useTranslation(settings.language)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    odometer: "",
    liters: "",
    cost_per_liter: "1.451", // Default price per liter for Azores
    fuel_station_id: "",
    driver_id: "",
    notes: "",
  })

  const [validationFlags, setValidationFlags] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculatedEfficiency, setCalculatedEfficiency] = useState<number>(0)
  const [fuelStations, setFuelStations] = useState<FuelStation[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Fetch fuel stations
        const { data: stationsData, error: stationsError } = await supabase
          .from("fuel_stations")
          .select("id, name, brand, address, is_active")
          .eq("is_active", true)
          .order("name")

        if (stationsError) {
          console.error("Error fetching fuel stations:", stationsError)
        } else {
          setFuelStations(stationsData || [])
        }

        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from("drivers")
          .select("id, name, internal_number, is_active")
          .eq("is_active", true)
          .order("name")

        if (driversError) {
          console.error("Error fetching drivers:", driversError)
        } else {
          setDrivers(driversData || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
          cost_per_liter: Number.parseFloat(formData.cost_per_liter),
          total_cost: Number.parseFloat(totalCost),
          fuel_station_id: formData.fuel_station_id || null,
          driver_id: formData.driver_id || null,
          distance_since_last_refuel: kmDriven > 0 ? kmDriven : null,
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
          fuel_station_id: "",
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

  const formatVehicleNumber = (vehicleId: string) => {
    // Extract number from vehicle ID and format with leading zeros
    const match = vehicleId.match(/(\d+)/)
    if (match) {
      const num = Number.parseInt(match[1])
      if (num >= 1 && num <= 9) {
        return vehicleId.replace(/\d+/, num.toString().padStart(2, "0"))
      }
    }
    return vehicleId
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t("common.loading")}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          {t("refuel.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedVehicle && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {t("refuel.vehicle")} {formatVehicleNumber(selectedVehicle)}
                </span>
                <Badge variant="outline">
                  {t("refuel.lastOdometer")}: {lastOdometer} km
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {t("refuel.lastRefuel")}: {lastRefuelDate || t("refuel.noRecords")} | {t("refuel.avgEfficiency")}:{" "}
                {avgEfficiency.toFixed(2)} L/100km
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">{t("refuel.date")}</Label>
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
                  <AlertDescription>{t("refuel.historicalEntry")}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="odometer">{t("refuel.odometer")}</Label>
              <Input
                id="odometer"
                type="number"
                value={formData.odometer}
                onChange={(e) => handleFieldChange("odometer", e.target.value)}
                placeholder={`${t("refuel.lastOdometer")}: ${lastOdometer} km`}
                required
              />
              {kmDriven > 0 && (
                <div className="text-sm text-muted-foreground mt-1">
                  {t("refuel.distanceDriven")}: {kmDriven} km
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="liters">{t("refuel.liters")} *</Label>
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
              <Label htmlFor="cost_per_liter">{t("refuel.pricePerLiter")} *</Label>
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
              <Label>{t("refuel.totalCost")}</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted text-muted-foreground">
                <span className="text-sm font-medium">€{totalCost}</span>
              </div>
            </div>

            <div>
              <Label>{t("refuel.efficiency")}</Label>
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
              <Label htmlFor="fuel_station_id">{t("refuel.fuelStation")}</Label>
              <Select
                value={formData.fuel_station_id}
                onValueChange={(value) => handleFieldChange("fuel_station_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("refuel.selectFuelStation")} />
                </SelectTrigger>
                <SelectContent>
                  {fuelStations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.brand} - {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="driver_id">{t("refuel.driver")}</Label>
              <Select value={formData.driver_id} onValueChange={(value) => handleFieldChange("driver_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("refuel.selectDriver")} />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.internal_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{t("refuel.notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder={t("refuel.notesPlaceholder")}
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
              {t("refuel.saveDraft")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || validationFlags.some((flag) => flag.severity === "error")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? t("refuel.saving") : t("refuel.saveRecord")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
