export type UserRole = "admin" | "fleet_manager" | "maintenance_tech" | "driver" | "viewer"

export interface Permission {
  resource: string
  action: "create" | "read" | "update" | "delete"
  condition?: (user: any, resource: any) => boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: "*", action: "create" },
    { resource: "*", action: "read" },
    { resource: "*", action: "update" },
    { resource: "*", action: "delete" },
  ],
  fleet_manager: [
    { resource: "vehicles", action: "create" },
    { resource: "vehicles", action: "read" },
    { resource: "vehicles", action: "update" },
    { resource: "vehicles", action: "delete" },
    { resource: "refuel_records", action: "create" },
    { resource: "refuel_records", action: "read" },
    { resource: "refuel_records", action: "update" },
    { resource: "refuel_records", action: "delete" },
    { resource: "drivers", action: "create" },
    { resource: "drivers", action: "read" },
    { resource: "drivers", action: "update" },
    { resource: "maintenance_schedules", action: "read" },
    { resource: "analytics", action: "read" },
  ],
  maintenance_tech: [
    { resource: "vehicles", action: "read" },
    { resource: "maintenance_schedules", action: "create" },
    { resource: "maintenance_schedules", action: "read" },
    { resource: "maintenance_schedules", action: "update" },
    { resource: "maintenance_interventions", action: "create" },
    { resource: "maintenance_interventions", action: "read" },
    { resource: "maintenance_interventions", action: "update" },
  ],
  driver: [
    { resource: "refuel_records", action: "create", condition: (user, record) => record.driver_id === user.id },
    { resource: "refuel_records", action: "read", condition: (user, record) => record.driver_id === user.id },
    {
      resource: "vehicles",
      action: "read",
      condition: (user, vehicle) => user.assigned_vehicles?.includes(vehicle.id),
    },
  ],
  viewer: [
    { resource: "vehicles", action: "read" },
    { resource: "refuel_records", action: "read" },
    { resource: "analytics", action: "read" },
  ],
}

export class PermissionManager {
  static hasPermission(userRole: UserRole, resource: string, action: string, user?: any, resourceData?: any): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || []

    // Check for wildcard permissions (admin)
    const wildcardPermission = permissions.find((p) => p.resource === "*" && p.action === action)
    if (wildcardPermission) return true

    // Check for specific resource permissions
    const resourcePermission = permissions.find((p) => p.resource === resource && p.action === action)
    if (!resourcePermission) return false

    // Check condition if exists
    if (resourcePermission.condition && user && resourceData) {
      return resourcePermission.condition(user, resourceData)
    }

    return true
  }

  static canCreate(userRole: UserRole, resource: string): boolean {
    return this.hasPermission(userRole, resource, "create")
  }

  static canRead(userRole: UserRole, resource: string, user?: any, resourceData?: any): boolean {
    return this.hasPermission(userRole, resource, "read", user, resourceData)
  }

  static canUpdate(userRole: UserRole, resource: string, user?: any, resourceData?: any): boolean {
    return this.hasPermission(userRole, resource, "update", user, resourceData)
  }

  static canDelete(userRole: UserRole, resource: string, user?: any, resourceData?: any): boolean {
    return this.hasPermission(userRole, resource, "delete", user, resourceData)
  }
}
