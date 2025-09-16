import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AssignmentDetailTabs } from "@/components/assignments/AssignmentDetailTabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"

interface AssignmentDetailPageProps {
  params: {
    id: string
  }
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get assignment type with related data
  const { data: assignment, error } = await supabase.from("assignment_types").select("*").eq("id", params.id).single()

  if (error || !assignment) {
    notFound()
  }

  // Get vehicles using this assignment type
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(`
      *,
      department:departments(name),
      category:vehicle_categories(name),
      home_location:locations!home_location_id(name, address)
    `)
    .eq("assignment_type_id", params.id)
    .order("license_plate", { ascending: true })

  // Get usage statistics
  const vehicleCount = vehicles?.length || 0
  const activeVehicleCount = vehicles?.filter((v) => v.status === "active")?.length || 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assignments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à lista
            </Button>
          </Link>
        </div>
        <Link href={`/assignments/${params.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Atribuição
          </Button>
        </Link>
      </div>

      {/* Assignment Header */}
      <div className="bg-muted/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Detalhes da atribuição</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl font-semibold">{assignment.name}</span>
              <Badge variant="outline">
                {vehicleCount} {vehicleCount === 1 ? "veículo" : "veículos"}
              </Badge>
              <Badge variant="default">
                {activeVehicleCount} {activeVehicleCount === 1 ? "ativo" : "ativos"}
              </Badge>
            </div>
            {assignment.description && <p className="text-muted-foreground mt-2">{assignment.description}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Criado em: {formatDate(assignment.created_at)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">ID: {assignment.id}</p>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <AssignmentDetailTabs assignment={assignment} vehicles={vehicles || []} />
    </div>
  )
}
