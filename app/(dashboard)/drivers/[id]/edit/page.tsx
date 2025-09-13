import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DriverForm } from "@/components/drivers/DriverForm"

interface EditDriverPageProps {
  params: {
    id: string
  }
}

export default async function EditDriverPage({ params }: EditDriverPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get driver with related data
  const { data: driver, error } = await supabase
    .from("drivers")
    .select(`
      *,
      user:users(name, email, phone),
      department:departments(name)
    `)
    .eq("id", params.id)
    .single()

  if (error || !driver) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Condutor</h1>
        <p className="text-muted-foreground">Editar informações do condutor {driver.user?.name}</p>
      </div>

      <DriverForm driver={driver} />
    </div>
  )
}
