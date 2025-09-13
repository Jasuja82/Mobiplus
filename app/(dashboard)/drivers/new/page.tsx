import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DriverForm } from "@/components/drivers/DriverForm"

export default async function NewDriverPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Novo Condutor</h1>
        <p className="text-muted-foreground">Adicionar um novo condutor à frota MobiAzores</p>
      </div>

      <DriverForm />
    </div>
  )
}
