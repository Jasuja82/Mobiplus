import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { PrimeThemeProvider } from "@/components/prime/PrimeThemeProvider"
import { Toaster } from "@/components/ui/toaster"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { AuthProvider } from "@/hooks/use-auth"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/primereact@10.8.3/resources/themes/lara-light-cyan/theme.css"
          id="theme-link"
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/primereact@10.8.3/resources/primereact.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/primeicons@7.0.0/primeicons.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/primeflex@3.3.1/primeflex.css" />
      </head>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PrimeThemeProvider>
            <AuthProvider>
              <SettingsProvider>
                <SidebarProvider>
                  <Suspense fallback={<div>Loading...</div>}>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <main className="flex-1">{children}</main>
                    </div>
                  </Suspense>
                </SidebarProvider>
              </SettingsProvider>
            </AuthProvider>
          </PrimeThemeProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
