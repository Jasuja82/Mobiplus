import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AssignmentsTable } from "@/components/assignments/AssignmentsTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function AssignmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get assignment types
  const { data: assignmentTypes, error } = await supabase
    .from("assignment_types")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching assignment types:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Atribuições</h1>
          <p className="text-muted-foreground">Gerir os tipos de atribuições de veículos da MobiAzores</p>
        </div>
        <Link href="/assignments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Atribuição
          </Button>
        </Link>
      </div>

      <AssignmentsTable assignments={assignmentTypes || []} />
    </div>
  )
}
