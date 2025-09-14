"use client"

import { Settings, Shield, Users, Database, Bell, Palette } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/settings/general-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { SuperuserPanel } from "@/components/settings/superuser-panel"
import { UserManagement } from "@/components/settings/user-management"
import { SystemSettings } from "@/components/settings/system-settings"
import { HybridAuthProvider, useHybridAuth } from "@/hooks/use-auth-hybrid"

interface User {
  id: string
  email: string
  name?: string
  role: string
  department?: string
  assigned_vehicles?: string[]
}

interface SettingsPageClientProps {
  initialUser: User | null
}

function SettingsContent() {
  const { user, isHydrated } = useHybridAuth()

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === "admin"

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure fleet management system preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-4"}`}>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="superuser" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Superuser
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="superuser">
            <SuperuserPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export function SettingsPageClient({ initialUser }: SettingsPageClientProps) {
  return (
    <HybridAuthProvider initialUser={initialUser}>
      <SettingsContent />
    </HybridAuthProvider>
  )
}
