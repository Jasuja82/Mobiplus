"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface User {
  id: string
  email: string
  name?: string
  role: string
  department?: string
  assigned_vehicles?: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  isHydrated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  initialUser?: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [loading, setLoading] = useState(!initialUser)
  const [isHydrated, setIsHydrated] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    setIsHydrated(true)

    // If we have initial user data from SSR, use it and skip loading
    if (initialUser) {
      setUser(initialUser)
      setLoading(false)
      return
    }

    // Get initial session client-side only if no initial user provided
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              ...profile,
            })
          }
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              ...profile,
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, initialUser])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error: error?.message }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
      },
    })

    return { error: error?.message }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    hasAnyRole,
    isHydrated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useSupabaseAuth(): AuthContextType {
  return useAuth()
}
