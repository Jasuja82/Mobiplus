"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  BarChart3Icon,
  CarIcon,
  UsersIcon,
  FuelIcon,
  WrenchIcon,
  UploadIcon,
  MapPinIcon,
  BuildingIcon,
  SettingsIcon,
  TagIcon,
} from "lucide-react"
import { useSettings } from "@/contexts/SettingsContext"
import { useTranslation } from "@/lib/i18n"

export function AppSidebar() {
  const pathname = usePathname()
  const { settings } = useSettings()
  const { t } = useTranslation(settings.language)

  const navigation = [
    {
      title: t("nav.dashboard"),
      url: "/dashboard",
      icon: BarChart3Icon,
    },
    {
      title: t("nav.vehicles"),
      url: "/vehicles",
      icon: CarIcon,
    },
    {
      title: t("nav.drivers"),
      url: "/drivers",
      icon: UsersIcon,
    },
    {
      title: t("nav.refuel"),
      url: "/refuel",
      icon: FuelIcon,
    },
    {
      title: t("nav.maintenance"),
      url: "/maintenance",
      icon: WrenchIcon,
    },
    {
      title: t("nav.locations"),
      url: "/locations",
      icon: MapPinIcon,
    },
    {
      title: t("nav.departments"),
      url: "/departments",
      icon: BuildingIcon,
    },
    {
      title: t("nav.assignments"),
      url: "/assignments",
      icon: TagIcon,
    },
    {
      title: t("nav.analytics"),
      url: "/analytics",
      icon: BarChart3Icon,
    },
    {
      title: t("nav.import"),
      url: "/import",
      icon: UploadIcon,
    },
    {
      title: t("nav.settings"),
      url: "/settings",
      icon: SettingsIcon,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CarIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">MobiAzores</span>
            <span className="text-xs text-muted-foreground">Fleet Management</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">© 2024 MobiAzores</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
