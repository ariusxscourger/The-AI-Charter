"use client"

import { AgentOverview } from "@/components/dashboard/AgentOverview"
import { AuditLedgerList } from "@/components/dashboard/AuditLedgerList"
import { GovernanceProcess } from "@/components/dashboard/GovernanceProcess"
import { MetricsPanel } from "@/components/dashboard/MetricsPanel"
import { PageTransition } from "@/components/layout/PageTransition"
import { getHistoricalRecords } from "@/lib/api"
import type { GovernanceRecord } from "@/types/charter"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function DashboardClient() {
  const [records, setRecords] = useState<GovernanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecords() {
      try {
        const data = await getHistoricalRecords()
        setRecords(data)
      } catch (error) {
        console.error("Failed to load records:", error)
      } finally {
        setLoading(false)
      }
    }
    loadRecords()
  }, [])

  const totalAudits = records.length
  const approvedCount = records.filter((r) => r.verdict === "approved").length

  return (
    <PageTransition>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Main Hub */}
        <div className="space-y-8 lg:col-span-2">
          {/* Hero Banner Section */}
          <div className="relative overflow-hidden rounded-lg border border-[#C7C7C7] bg-[#1F2937] p-8 text-[#FAF8F5] shadow-xl">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#76E1A7]/5 blur-3xl" />

            <div className="relative z-10 max-w-xl space-y-3">
              <span className="inline-flex items-center gap-1.5 font-bold font-mono text-[#76E1A7] text-[10px] uppercase tracking-wider">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#76E1A7]" />
                Active Multi-Agent Grid v1.0.0
              </span>
              <h2 className="font-extrabold font-sans text-3xl uppercase leading-none tracking-tight">
                Structured Pre-Release AI Governance
              </h2>
              <p className="pt-1 font-sans text-[#FAF8F5]/70 text-xs leading-relaxed">
                Verify ethics, security, compliance, legal exposure, and product parameters using 5 specialized
                autonomous agents connected to a shared Band.ai room. Ensure transparent reviews with an immutable audit
                trail.
              </p>
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap gap-4">
              <Link
                href="/submit"
                className="flex h-10 animate-pulse cursor-pointer items-center justify-center gap-2 rounded-[20px] bg-[#76E1A7] px-5 font-bold text-[#1F2937] text-xs uppercase tracking-wide transition-all hover:bg-[#8BF5BD] hover:shadow-[0_0_15px_rgba(118,225,167,0.5)]"
              >
                <Plus className="h-4 w-4 stroke-[3px]" />
                PROPOSE NEW FEATURE
              </Link>
            </div>
          </div>

          <MetricsPanel totalAudits={totalAudits} approvedCount={approvedCount} />

          <AgentOverview />

          <GovernanceProcess />
        </div>

        {/* Right Column: Historical Ledgers */}
        <div className="space-y-6 lg:col-span-1">
          <AuditLedgerList records={records} loading={loading} />
        </div>
      </div>
    </PageTransition>
  )
}
