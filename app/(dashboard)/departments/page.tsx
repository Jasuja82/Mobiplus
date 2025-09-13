import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DepartmentsTable } from "@/components/departments/DepartmentsTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function DepartmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get departments with manager information
  const { data: departments, error } = await supabase
    .from("departments")
    .select(`
      *,
      manager:users(name, email)
    `)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching departments:", error)
  }

  return (
    <div className="container mx-auto space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Departamentos</h1>
          <p className="text-muted-foreground">Gerir os departamentos da MobiAzores</p>
        </div>
        <Button className="hover:bg-primary/90 transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Departamento
        </Button>
      </div>

      <DepartmentsTable departments={departments || []} />
    </div>
  )
}
