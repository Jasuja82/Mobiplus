import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AssignmentForm } from "@/components/assignments/AssignmentForm"

export default async function NewAssignmentPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Atribuição</h1>
        <p className="text-muted-foreground">Adicione um novo tipo de atribuição à MobiAzores</p>
      </div>

      <AssignmentForm />
    </div>
  )
}
