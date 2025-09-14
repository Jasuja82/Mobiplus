"use client"

import type React from "react"

import { PrimeReactProvider } from "primereact/api"
import { useTheme } from "next-themes"
import { useEffect } from "react"

interface PrimeThemeProviderProps {
  children: React.ReactNode
}

export function PrimeThemeProvider({ children }: PrimeThemeProviderProps) {
  const { theme } = useTheme()

  useEffect(() => {
    const themeLink = document.getElementById("theme-link") as HTMLLinkElement
    if (themeLink) {
      themeLink.href = theme === "dark" ? "/themes/lara-dark-cyan/theme.css" : "/themes/lara-light-cyan/theme.css"
    }
  }, [theme])

  return (
    <PrimeReactProvider
      value={{
        ripple: true,
        inputStyle: "outlined",
        locale: "pt",
        appendTo: "self",
      }}
    >
      {children}
    </PrimeReactProvider>
  )
}
