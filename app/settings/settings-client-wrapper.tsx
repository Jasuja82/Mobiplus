"use client"

import dynamic from "next/dynamic"
import { AuthProvider } from "@/hooks/use-auth.tsx"

const SettingsContent = dynamic(() => import("@/components/settings/settings-content"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

interface SettingsClientWrapperProps {
  initialUser: any
}

export default function SettingsClientWrapper({ initialUser }: SettingsClientWrapperProps) {
  return (
    <AuthProvider initialUser={initialUser}>
      <SettingsContent />
    </AuthProvider>
  )
}
