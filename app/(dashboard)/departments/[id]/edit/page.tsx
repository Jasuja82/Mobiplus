import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DepartmentForm } from "@/components/departments/DepartmentForm"

export default async function EditDepartmentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get department data
  const { data: department, error: departmentError } = await supabase
    .from("departments")
    .select("*")
    .eq("id", params.id)
    .single()

  if (departmentError || !department) {
    redirect("/departments")
  }

  // Get locations for the form
  const { data: locations } = await supabase.from("locations").select("*").eq("is_active", true).order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Departamento</h1>
        <p className="text-muted-foreground">Edite os dados do departamento {department.name}</p>
      </div>

      <DepartmentForm locations={locations || []} department={department} />
    </div>
  )
}
