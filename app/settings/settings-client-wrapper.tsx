"use client"

import dynamic from "next/dynamic"

const SettingsContent = dynamic(() => import("@/components/settings/settings-content"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

export default function SettingsClientWrapper() {
  return <SettingsContent />
}
