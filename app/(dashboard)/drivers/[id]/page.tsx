import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DriverDetailTabs } from "@/components/drivers/DriverDetailTabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"

interface DriverDetailPageProps {
  params: {
    id: string
  }
}

export default async function DriverDetailPage({ params }: DriverDetailPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const driverId = Number.parseInt(params.id)
  if (isNaN(driverId)) {
    notFound()
  }

  // Get driver with all related data
  const { data: driver, error } = await supabase
    .from("drivers")
    .select(`
      *,
      department:departments(name, description)
    `)
    .eq("id", driverId)
    .single()

  if (error || !driver) {
    notFound()
  }

  // Get current vehicle assignments
  const { data: currentAssignments } = await supabase
    .from("vehicle_assignments")
    .select(`
      *,
      vehicle:vehicles(
        license_plate,
        make,
        model,
        internal_number,
        vehicle_number
      )
    `)
    .eq("driver_id", driverId)
    .eq("is_active", true)

  // Get assignment history
  const { data: assignmentHistory } = await supabase
    .from("vehicle_assignments")
    .select(`
      *,
      vehicle:vehicles(
        license_plate,
        make,
        model,
        internal_number,
        vehicle_number
      ),
      assigned_by_user:users!vehicle_assignments_assigned_by_fkey(name)
    `)
    .eq("driver_id", driverId)
    .order("assigned_at", { ascending: false })
    .limit(20)

  // Get refuel records for this driver
  const { data: refuelRecords } = await supabase
    .from("refuel_records")
    .select(`
      *,
      vehicle:vehicles(license_plate, make, model)
    `)
    .eq("driver_id", driverId)
    .order("refuel_date", { ascending: false })
    .limit(20)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT")
  }

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/drivers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à lista
            </Button>
          </Link>
        </div>
        <Link href={`/drivers/${params.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Condutor
          </Button>
        </Link>
      </div>

      {/* Driver Header */}
      <div className="bg-muted/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Detalhes do condutor</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl font-semibold">{driver.name}</span>
              <Badge variant={driver.is_active ? "default" : "secondary"}>
                {driver.is_active ? "Ativo" : "Inativo"}
              </Badge>
              {driver.license_expiry && isLicenseExpiringSoon(driver.license_expiry) && (
                <Badge variant="destructive">Carta expira em breve</Badge>
              )}
              {driver.medical_certificate_expiry && isLicenseExpiringSoon(driver.medical_certificate_expiry) && (
                <Badge variant="destructive">Certificado médico expira em breve</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {driver.license_number && (
                <>
                  <span>Carta: {driver.license_number}</span>
                  <span>•</span>
                </>
              )}
              <span>Departamento: {driver.department?.name || "Não atribuído"}</span>
            </div>
            {driver.internal_number && (
              <p className="text-sm text-muted-foreground mt-1">Nº Interno: {driver.internal_number}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <DriverDetailTabs
        driver={driver}
        currentAssignments={currentAssignments || []}
        assignmentHistory={assignmentHistory || []}
        refuelRecords={refuelRecords || []}
      />
    </div>
  )
}
