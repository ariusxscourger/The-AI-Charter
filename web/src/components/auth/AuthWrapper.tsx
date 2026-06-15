"use client"

import { useAuth } from "@/context/AuthContext"
import { ReactNode } from "react"

interface AuthWrapperProps {
  children: ReactNode
  fallback: ReactNode
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return fallback
  }

  return children
}
