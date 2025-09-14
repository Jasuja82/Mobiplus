"use client"

import React from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { useTheme } from "next-themes"

interface MaterialThemeProviderProps {
  children: React.ReactNode
}

export function MaterialThemeProvider({ children }: MaterialThemeProviderProps) {
  const { theme } = useTheme()

  const materialTheme = React.useMemo(() => {
    const isDark = theme === "dark"

    return createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: {
          main: "#059669",
          light: "#10b981",
          dark: "#047857",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#10b981",
          light: "#34d399",
          dark: "#059669",
          contrastText: "#ffffff",
        },
        background: {
          default: isDark ? "#0f172a" : "#ffffff",
          paper: isDark ? "#1e293b" : "#f1f5f9",
        },
        text: {
          primary: isDark ? "#f1f5f9" : "#475569",
          secondary: isDark ? "#94a3b8" : "#64748b",
        },
        divider: isDark ? "#334155" : "#e2e8f0",
        error: {
          main: "#d97706",
        },
      },
      typography: {
        fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontFamily: '"Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 700,
        },
        h2: {
          fontFamily: '"Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 700,
        },
        h3: {
          fontFamily: '"Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 600,
        },
        h4: {
          fontFamily: '"Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 600,
        },
        h5: {
          fontFamily: '"Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 600,
        },
        h6: {
          fontFamily: '"Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                transform: "translateY(-2px)",
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 8,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
          },
        },
      },
    })
  }, [theme])

  return (
    <ThemeProvider theme={materialTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
