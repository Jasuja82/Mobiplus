import { Card, CardContent, Chip, Box, Typography, Avatar } from "@mui/material"
import { Car, Wrench, AlertTriangle, CheckCircle } from "lucide-react"

interface DashboardOverviewProps {
  vehicleStats: {
    total: number
    active: number
    maintenance: number
    inactive: number
  }
}

export function DashboardOverview({ vehicleStats }: DashboardOverviewProps) {
  const stats = [
    {
      title: "Veículos Ativos",
      value: vehicleStats.active,
      description: "Disponíveis para uso",
      icon: Car,
      color: "success" as const,
      bgColor: "#e8f5e8",
      iconColor: "#2e7d32",
      chipColor: "success" as const,
    },
    {
      title: "Em Manutenção",
      value: vehicleStats.maintenance,
      description: "Indisponíveis temporariamente",
      icon: Wrench,
      color: "warning" as const,
      bgColor: "#fff3e0",
      iconColor: "#f57c00",
      chipColor: "warning" as const,
    },
    {
      title: "Inativos",
      value: vehicleStats.inactive,
      description: "Fora de serviço",
      icon: AlertTriangle,
      color: "error" as const,
      bgColor: "#ffebee",
      iconColor: "#d32f2f",
      chipColor: "error" as const,
    },
    {
      title: "Total da Frota",
      value: vehicleStats.total,
      description: "Todos os veículos",
      icon: CheckCircle,
      color: "info" as const,
      bgColor: "#e3f2fd",
      iconColor: "#1976d2",
      chipColor: "info" as const,
    },
  ]

  return (
    <Box
      sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" } }}
    >
      {stats.map((stat) => (
        <Card
          key={stat.title}
          sx={{
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: stat.bgColor,
                  width: 48,
                  height: 48,
                  "& svg": { color: stat.iconColor },
                }}
              >
                <stat.icon size={24} />
              </Avatar>
              <Chip label={stat.color} color={stat.chipColor} size="small" variant="outlined" />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "text.secondary",
                }}
              >
                {stat.title}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {stat.description}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
