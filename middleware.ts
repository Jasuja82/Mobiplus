import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log("[v0] Middleware processing:", request.nextUrl.pathname)
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api routes (let them handle their own middleware)
     * - auth routes (let them handle their own auth)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/|login|signup|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
