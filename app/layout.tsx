import type React from "react"
import type { Metadata } from "next"
import "@/styles/globals.css" // Added CSS import to include global styling
import { Analytics } from "@vercel/analytics/next"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { AuthProvider } from "@/hooks/use-auth"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "MobiAzores Fleet Management",
  description: "Comprehensive fleet management system for MobiAzores",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body>
        <AuthProvider>
          <SettingsProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <main>{children}</main>
            </Suspense>
          </SettingsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
