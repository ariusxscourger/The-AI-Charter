"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, FileText, Search } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import type { GovernanceRecord } from "@/types/charter"

interface AuditLedgerListProps {
  records: GovernanceRecord[]
  loading: boolean
}

export function AuditLedgerList({ records, loading }: AuditLedgerListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterVerdict, setFilterVerdict] = useState<string>("all")

  const getVerdictVariant = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case "approved":
        return "approved"
      case "rejected":
        return "rejected"
      case "conditional_approval":
        return "conditional"
      default:
        return "review"
    }
  }

  const formatVerdict = (verdict: string) => {
    return verdict.replace(/_/g, " ")
  }

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.referenceId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVerdict = filterVerdict === "all" || rec.verdict === filterVerdict
    return matchesSearch && matchesVerdict
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
          <FileText className="h-4 w-4" />
          Hardened Audit Ledgers
        </h3>
        {records.length > 0 && (
          <span className="font-mono text-[#1F2937]/40 text-[10px]">({filteredRecords.length} found)</span>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or reference ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-[#C7C7C7] bg-[#FAF8F5] pr-3 pl-10 font-mono text-[#1F2937] text-xs placeholder-[#C7C7C7] transition-all focus:border-[#1F2937] focus:ring-1 focus:ring-[#76E1A7]/30"
          />
          <Search className="absolute top-3 left-3 h-4 w-4 text-[#C7C7C7]" />
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-[10px]">
          {[
            { label: "ALL", value: "all" },
            { label: "APPROVED", value: "approved" },
            { label: "REJECTED", value: "rejected" },
            { label: "CONDITIONAL", value: "conditional_approval" },
          ].map((btn) => (
            <button
              type="button"
              key={btn.value}
              onClick={() => setFilterVerdict(btn.value)}
              className={`cursor-pointer rounded-md border px-3 py-1.5 font-bold uppercase transition-all ${
                filterVerdict === btn.value
                  ? "border-[#1F2937] bg-[#1F2937] text-[#FAF8F5] shadow-md shadow-black/10"
                  : "border-[#C7C7C7]/60 text-[#1F2937]/60 hover:border-[#1F2937]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="flex flex-col items-center justify-center border border-[#C7C7C7]/50 py-16 text-center">
              <FileText className="mb-3 h-8 w-8 text-[#C7C7C7]" />
              <p className="font-mono text-[#1F2937]/50 text-xs uppercase">No matching ledgers</p>
            </Card>
          </motion.div>
        ) : (
          <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2 scrollbar-thin">
            {filteredRecords.map((record, i) => (
              <motion.div
                key={record.sessionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Link href={`/record/${record.sessionId}`} className="group block">
                  <motion.div whileHover={{ scale: 1.01, translateY: -2 }} transition={{ duration: 0.2 }}>
                    <Card className="border border-[#C7C7C7]/60 py-4 shadow-sm transition-all hover:shadow-md hover:border-[#1F2937] bg-[#FAF8F5]">
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="font-mono text-[#1F2937]/40 text-xs tracking-wider">{record.referenceId}</span>
                        <Badge variant={getVerdictVariant(record.verdict)}>{formatVerdict(record.verdict)}</Badge>
                      </div>

                      <h4 className="truncate font-bold font-sans text-[#1F2937] text-sm transition-colors group-hover:text-[#38B0E8]">
                        {record.featureName}
                      </h4>

                      <div className="mt-3 flex items-center gap-4 border-[#C7C7C7]/40 border-t pt-2 font-mono text-[#1F2937]/50 text-[10px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.completedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="ml-auto flex items-center gap-1 font-bold uppercase transition-colors group-hover:text-[#38B0E8]">
                          OPEN RECORD
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
