"use client"

import { Activity, FileCheck, Users } from "lucide-react"

interface MetricsPanelProps {
  totalAudits: number
  approvedCount: number
}

export function MetricsPanel({ totalAudits, approvedCount }: MetricsPanelProps) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-md border border-[#C7C7C7] bg-[#FAF8F5] shadow-sm">
      <div className="space-y-1 border-[#C7C7C7] border-r p-5">
        <span className="flex items-center gap-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">
          <Activity className="h-3 w-3 text-[#38B0E8]" />
          Proposals Audited
        </span>
        <span className="block font-black font-sans text-2xl text-[#1F2937] tracking-tight">{totalAudits}</span>
      </div>

      <div className="space-y-1 border-[#C7C7C7] border-r p-5">
        <span className="flex items-center gap-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">
          <FileCheck className="h-3 w-3 text-[#76E1A7]" />
          Approved Verdicts
        </span>
        <span className="block font-black font-sans text-2xl text-[#1F2937] tracking-tight">{approvedCount}</span>
      </div>

      <div className="space-y-1 p-5">
        <span className="flex items-center gap-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">
          <Users className="h-3 w-3 text-red-400" />
          Active Agents
        </span>
        <span className="block font-black font-sans text-2xl text-[#1F2937] tracking-tight">5 Connected</span>
      </div>
    </div>
  )
}
