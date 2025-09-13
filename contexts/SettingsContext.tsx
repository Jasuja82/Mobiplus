"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface AppSettings {
  language: "en" | "pt"
  darkMode: boolean
  compactView: boolean
  currency: string
  timezone: string
  dateFormat: string
  fuelUnit: string
  distanceUnit: string
}

const defaultSettings: AppSettings = {
  language: "pt",
  darkMode: false,
  compactView: false,
  currency: "EUR",
  timezone: "Atlantic/Azores",
  dateFormat: "DD/MM/YYYY",
  fuelUnit: "liters",
  distanceUnit: "kilometers",
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load settings from localStorage or API
    const loadSettings = async () => {
      try {
        const stored = localStorage.getItem("app-settings")
        if (stored) {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    try {
      localStorage.setItem("app-settings", JSON.stringify(updated))
      // Also save to API if needed
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  return <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
