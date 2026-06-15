import type * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  terminalTitle?: string
}

export function Card({ children, className, terminalTitle, ...props }: CardProps) {
  if (terminalTitle) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-[#C7C7C7] bg-[#1F2937] text-[#FAF8F5] shadow-xl",
          className,
        )}
        {...props}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-[#FAF8F5]/10 border-b bg-[#111827] px-4 py-2 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#76E1A7]/70" />
          </div>
          <span className="max-w-[200px] truncate font-semibold text-[#FAF8F5]/60">{terminalTitle}</span>
          <span className="text-[#FAF8F5]/30">bash</span>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative rounded-md border border-[#C7C7C7] bg-[#FAF8F5] p-5 text-[#1F2937] shadow-xs transition-all hover:border-[#1F2937]/30",
        className,
      )}
      {...props}
    >
      {/* Retrotech Crosshairs Decoration on corners */}
      <span className="absolute -top-1.5 -left-1.5 select-none font-mono text-[#C7C7C7] text-xs">+</span>
      <span className="absolute -top-1.5 -right-1.5 select-none font-mono text-[#C7C7C7] text-xs">+</span>
      <span className="absolute -bottom-1.5 -left-1.5 select-none font-mono text-[#C7C7C7] text-xs">+</span>
      <span className="absolute -right-1.5 -bottom-1.5 select-none font-mono text-[#C7C7C7] text-xs">+</span>
      {children}
    </div>
  )
}
