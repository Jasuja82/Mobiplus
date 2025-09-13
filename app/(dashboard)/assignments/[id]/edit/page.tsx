import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AssignmentForm } from "@/components/assignments/AssignmentForm"

export default async function EditAssignmentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get assignment data
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignment_types")
    .select("*")
    .eq("id", params.id)
    .single()

  if (assignmentError || !assignment) {
    redirect("/assignments")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Atribuição</h1>
        <p className="text-muted-foreground">Edite os dados da atribuição {assignment.name}</p>
      </div>

      <AssignmentForm assignment={assignment} />
    </div>
  )
}
