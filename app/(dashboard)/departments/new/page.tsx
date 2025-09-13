import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DepartmentForm } from "@/components/departments/DepartmentForm"

export default async function NewDepartmentPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get locations for the form
  const { data: locations } = await supabase.from("locations").select("*").eq("is_active", true).order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Departamento</h1>
        <p className="text-muted-foreground">Adicione um novo departamento à MobiAzores</p>
      </div>

      <DepartmentForm locations={locations || []} />
    </div>
  )
}
