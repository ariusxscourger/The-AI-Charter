"use client"

import { Logo } from "@/components/ui/Logo"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { Home, LogOut, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()

  const navItems = [
    { name: "Hub", href: "/dashboard", icon: Home },
    { name: "Propose", href: "/dashboard/submit", icon: Plus },
  ]

  if (loading) {
    return (
      <div className="relative flex min-h-screen select-none flex-col items-center justify-center bg-[#FAF8F5] font-sans text-[#1F2937]">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 rounded border border-[#C7C7C7] bg-[#FAF8F5] p-10 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1F2937] border-t-transparent" />
          <span className="font-mono text-[#1F2937]/70 text-xs uppercase tracking-widest">
            CONNECTING TO OPERATOR GRID...
          </span>
        </div>
      </div>
    )
  }

  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/signup"

  if (!user || isPublicRoute) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] font-sans text-[#1F2937] flex">
      {/* Background Retrotech Grid Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-20 flex flex-col border-r border-[#C7C7C7] bg-[#FAF8F5]/80 backdrop-blur-xl h-screen sticky top-0 overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#C7C7C7]/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo size="md" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-extrabold font-sans text-[#1F2937] text-sm uppercase tracking-tight whitespace-nowrap"
              >
                THE AI CHARTER
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/submit")) ||
                  pathname.startsWith("/review")
                : pathname.startsWith(item.href)
            return (
              <Link key={item.name} href={item.href} className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                    isActive
                      ? "bg-[#1F2937] text-[#FAF8F5]"
                      : "text-[#1F2937]/70 hover:bg-[#C7C7C7]/20 hover:text-[#1F2937]"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="font-bold font-mono text-xs uppercase tracking-wider whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#C7C7C7]/50 space-y-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-md p-2 text-[#1F2937]/50 hover:bg-[#C7C7C7]/20 hover:text-[#1F2937] transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>

          <button
            onClick={logout}
            className={`flex w-full items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} rounded-md py-2.5 text-red-500/80 hover:bg-red-500/10 transition-colors`}
            title="Disconnect"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-bold font-mono text-xs uppercase tracking-wider whitespace-nowrap">Disconnect</span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Global Navigation Header (Mobile/Extra info) */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-end border-b border-[#C7C7C7] bg-[#FAF8F5]/90 px-8 backdrop-blur-md">
          {user && (
            <div className="flex items-center gap-4 font-mono text-xs">
              <span className="hidden text-[#1F2937]/60 sm:inline-block">
                OPERATOR NODE: <span className="font-bold text-[#1F2937]">{user.email}</span>
              </span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-x-hidden p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  )
}
