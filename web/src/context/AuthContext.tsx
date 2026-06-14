"use client"

import { loginApi, registerApi } from "@/lib/api"
import { usePathname, useRouter } from "next/navigation"
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"

type User = {
  id: number
  email: string
  createdAt: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
  setError: (err: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  // Load token on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    }
  }, [])

  // Guard routes
  useEffect(() => {
    if (loading) return

    const publicRoutes = ["/login", "/signup", "/"]
    const isPublic = publicRoutes.includes(pathname)

    if (!token && !isPublic) {
      router.replace("/login")
    } else if (token && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/")
    }
  }, [token, pathname, loading, router])

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const data = await loginApi(email, password)
      const userData = {
        id: data.user.id,
        email: data.user.email,
        createdAt: data.user.created_at,
      }
      setUser(userData)
      setToken(data.token)
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(userData))
      }
      router.push("/")
    } catch (err) {
      const error = err as Error
      setError(error.message || "Invalid credentials")
      throw err
    }
  }

  const register = async (email: string, password: string) => {
    setError(null)
    try {
      const data = await registerApi(email, password)
      const userData = {
        id: data.user.id,
        email: data.user.email,
        createdAt: data.user.created_at,
      }
      setUser(userData)
      setToken(data.token)
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(userData))
      }
      router.push("/")
    } catch (err) {
      const error = err as Error
      setError(error.message || "Registration failed")
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
