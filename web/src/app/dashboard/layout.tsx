"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center font-mono text-[#1F2937]/50 text-xs">
        <span className="animate-pulse">Authenticating Node...</span>
      </div>
    )
  }

  return <>{children}</>
}
