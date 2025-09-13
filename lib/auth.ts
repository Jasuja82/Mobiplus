import { createClient } from "@/lib/supabase/client"
import type { User, AuthError, Session } from "@supabase/supabase-js"

export interface AuthUser extends User {
  user_metadata: {
    role?: string
    name?: string
    employee_number?: number
    department?: string
  }
}

export interface AuthResponse<T = any> {
  data?: T
  error?: AuthError | Error | null
  success: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  name: string
  employee_number?: number
  department?: string
  role?: "fleet_manager" | "maintenance_tech" | "admin" | "driver"
}

class AuthService {
  private supabase = createClient()

  async signIn(credentials: LoginCredentials): Promise<AuthResponse<{ user: AuthUser; session: Session }>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        }
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: new Error("Login failed - no user or session returned"),
        }
      }

      return {
        success: true,
        data: {
          user: data.user as AuthUser,
          session: data.session,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown login error"),
      }
    }
  }

  async signUp(credentials: SignupCredentials): Promise<AuthResponse<{ user: AuthUser }>> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            name: credentials.name,
            employee_number: credentials.employee_number,
            department: credentials.department || "General",
            role: credentials.role || "driver",
          },
        },
      })

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: new Error("Signup failed - no user returned"),
        }
      }

      return {
        success: true,
        data: { user: data.user as AuthUser },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown signup error"),
      }
    }
  }

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown signout error"),
      }
    }
  }

  async getCurrentUser(): Promise<AuthResponse<AuthUser>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        }
      }

      if (!user) {
        return {
          success: false,
          error: new Error("No authenticated user found"),
        }
      }

      return {
        success: true,
        data: user as AuthUser,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error getting user"),
      }
    }
  }

  async getSession(): Promise<AuthResponse<Session>> {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        }
      }

      if (!session) {
        return {
          success: false,
          error: new Error("No active session found"),
        }
      }

      return {
        success: true,
        data: session,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error getting session"),
      }
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  private formatAuthError(error: AuthError): Error {
    const errorMessages: Record<string, string> = {
      "Invalid login credentials": "Email ou palavra-passe incorretos",
      "Email not confirmed": "Por favor, confirme o seu email antes de fazer login",
      "User already registered": "Este email já está registado",
      "Password should be at least 6 characters": "A palavra-passe deve ter pelo menos 6 caracteres",
      "Invalid email": "Email inválido",
      "Signup requires a valid password": "É necessária uma palavra-passe válida",
    }

    const userFriendlyMessage = errorMessages[error.message] || error.message
    return new Error(userFriendlyMessage)
  }

  hasRole(user: AuthUser | null, requiredRole: string): boolean {
    if (!user) return false
    return user.user_metadata?.role === requiredRole
  }

  hasAnyRole(user: AuthUser | null, requiredRoles: string[]): boolean {
    if (!user) return false
    const userRole = user.user_metadata?.role
    return userRole ? requiredRoles.includes(userRole) : false
  }
}

export const authService = new AuthService()
