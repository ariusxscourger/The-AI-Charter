import type * as React from "react"
import { cn } from "@/lib/utils"

type Severity = "critical" | "high" | "medium" | "low" | "info" | "approved" | "rejected" | "conditional" | "review"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Severity
  children: React.ReactNode
}

export function Badge({ variant = "info", className, children, ...props }: BadgeProps) {
  const styles = {
    critical: "border-red-500/50 bg-red-500/10 text-red-700",
    high: "border-orange-500/50 bg-orange-500/10 text-orange-700",
    medium: "border-yellow-500/50 bg-yellow-500/20 text-yellow-800",
    low: "border-[#A1DFF5]/60 bg-[#A1DFF5]/20 text-[#005B82]",
    info: "border-[#38B0E8]/60 bg-[#38B0E8]/10 text-[#005B82]",
    approved: "border-[#76E1A7]/60 bg-[#76E1A7]/20 text-[#0E8A4C]",
    rejected: "border-red-500/50 bg-red-500/10 text-red-700",
    conditional: "border-orange-500/50 bg-orange-500/10 text-orange-700",
    review: "border-yellow-500/50 bg-yellow-500/20 text-yellow-800",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono font-semibold text-xs uppercase tracking-wider transition-colors",
        styles[variant] || styles.info,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
