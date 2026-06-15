"use client"

import { Logo } from "@/components/ui/Logo"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"

export function LandingHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-[#C7C7C7] border-b bg-[#FAF8F5]/90 px-8 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Logo size="md" />
        <span className="font-extrabold font-sans text-[#1F2937] text-xl uppercase tracking-tight">THE AI CHARTER</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="mr-4 hidden items-center gap-3 font-mono text-[#1F2937]/50 text-[10px] uppercase md:flex">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#76E1A7]" />
          GRID STATUS: OPERATIONAL
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-[20px] bg-[#1F2937] px-4 py-1.5 font-bold font-mono text-[#FAF8F5] text-xs uppercase tracking-wider transition-all hover:bg-[#38B0E8]"
            >
              ENTER OPERATOR HUB
            </Link>
            <button
              onClick={logout}
              className="rounded-[20px] border border-red-500/50 px-4 py-1.5 font-bold font-mono text-red-500 text-xs uppercase tracking-wider transition-all hover:bg-red-500 hover:text-white"
            >
              DISCONNECT
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-[20px] border border-[#1F2937] px-4 py-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider transition-all hover:bg-[#1F2937] hover:text-[#FAF8F5]"
          >
            CONNECT NODE
          </Link>
        )}
      </div>
    </header>
  )
}
