import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
    },
  })

  try {
    const { data, error } = await supabase
      .from("fuel_stations")
      .select(`
        *,
        location:locations(id, name)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching fuel station:", error)
      return NextResponse.json({ error: "Posto de combustível não encontrado" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in fuel-station GET:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
    },
  })

  try {
    const body = await request.json()

    const { data, error } = await supabase.from("fuel_stations").update(body).eq("id", params.id).select().single()

    if (error) {
      console.error("Error updating fuel station:", error)
      return NextResponse.json({ error: "Erro ao atualizar posto de combustível" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in fuel-station PUT:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
    },
  })

  try {
    const { error } = await supabase.from("fuel_stations").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting fuel station:", error)
      return NextResponse.json({ error: "Erro ao eliminar posto de combustível" }, { status: 500 })
    }

    return NextResponse.json({ message: "Posto de combustível eliminado com sucesso" })
  } catch (error) {
    console.error("Error in fuel-station DELETE:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
