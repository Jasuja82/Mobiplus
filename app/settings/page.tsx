import dynamic from "next/dynamic"
import { Settings } from "lucide-react"

const SettingsContent = dynamic(() => import("@/components/settings/settings-content"), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  ),
})

export default function SettingsPage() {
  return <SettingsContent />
}
