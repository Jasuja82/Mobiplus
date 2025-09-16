import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
    },
  })

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const isActive = searchParams.get("is_active")

    let query = supabase
      .from("fuel_stations")
      .select(`
        *,
        location:locations(id, name)
      `)
      .order("name")

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,address.ilike.%${search}%`)
    }

    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true")
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching fuel stations:", error)
      return NextResponse.json({ error: "Erro ao buscar postos de combustível" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in fuel-stations API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
    },
  })

  try {
    const body = await request.json()

    const { data, error } = await supabase.from("fuel_stations").insert([body]).select().single()

    if (error) {
      console.error("Error creating fuel station:", error)
      return NextResponse.json({ error: "Erro ao criar posto de combustível" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error in fuel-stations POST:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
