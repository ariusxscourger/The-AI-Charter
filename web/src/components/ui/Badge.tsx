import type * as React from "react"
import { cn } from "@/lib/utils"

type Severity = "critical" | "high" | "medium" | "low" | "info" | "approved" | "rejected" | "conditional" | "review"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Severity
  children: React.ReactNode
}

export function Badge({ variant = "info", className, children, ...props }: BadgeProps) {
  const styles = {
    critical: "border-red-500/30 bg-red-950/20 text-red-400",
    high: "border-orange-500/30 bg-orange-950/20 text-orange-400",
    medium: "border-yellow-500/30 bg-yellow-950/20 text-yellow-400",
    low: "border-[#A1DFF5]/30 bg-[#A1DFF5]/5 text-[#A1DFF5]",
    info: "border-[#38B0E8]/30 bg-[#38B0E8]/5 text-[#38B0E8]",
    approved: "border-[#76E1A7]/30 bg-[#76E1A7]/5 text-[#76E1A7]",
    rejected: "border-red-500/30 bg-red-950/20 text-red-400",
    conditional: "border-orange-500/30 bg-orange-950/20 text-orange-400",
    review: "border-yellow-500/30 bg-yellow-950/20 text-yellow-400",
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
