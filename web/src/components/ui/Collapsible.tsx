"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
  title: React.ReactNode
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
}

export function Collapsible({ title, children, className, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("rounded-md border border-[#C7C7C7] bg-[#FAF8F5]", className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 text-left font-bold font-mono text-[#1F2937] transition-colors hover:bg-[#F5EFE1]/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-[#1F2937]" /> : <ChevronDown className="h-4 w-4 text-[#1F2937]" />}
      </button>
      {isOpen && <div className="border-[#C7C7C7] border-t bg-[#FAF8F5] p-4">{children}</div>}
    </div>
  )
}
