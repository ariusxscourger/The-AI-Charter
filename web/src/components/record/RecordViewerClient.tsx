"use client"

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Database,
  HelpCircle,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Collapsible } from "@/components/ui/Collapsible"
import { getGovernanceRecord } from "@/lib/api"
import type { GovernanceRecord } from "@/types/charter"

const ConfidenceMeter = ({ level }: { level: string }) => {
  const bars = level.toLowerCase() === "high" ? 3 : level.toLowerCase() === "medium" ? 2 : 1
  return (
    <div className="flex items-end gap-1">
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className={`w-1.5 rounded-sm transition-all duration-300 ${bar <= bars ? "bg-[#1F2937]" : "bg-[#C7C7C7]/40"}`}
          style={{ height: `${bar * 4 + 6}px` }}
        />
      ))}
    </div>
  )
}

export function RecordViewerClient() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [record, setRecord] = useState<GovernanceRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecord() {
      try {
        const data = await getGovernanceRecord(sessionId)
        setRecord(data)
      } catch (err) {
        const error = err as Error
        console.error(error)
        setError(error.message || "Failed to load governance record")
      } finally {
        setLoading(false)
      }
    }
    loadRecord()
  }, [sessionId])

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "approved":
        return {
          bg: "bg-[#76E1A7]/10 border-[#76E1A7] text-[#1F2937] shadow-[0_0_20px_rgba(118,225,167,0.2)]",
          badge: "approved" as const,
          icon: (
            <CheckCircle className="h-10 w-10 stroke-[1.5px] text-[#76E1A7] drop-shadow-[0_0_8px_rgba(118,225,167,0.6)]" />
          ),
        }
      case "rejected":
        return {
          bg: "bg-red-500/10 border-red-500/60 text-[#1F2937] shadow-[0_0_20px_rgba(239,68,68,0.15)]",
          badge: "rejected" as const,
          icon: <XCircle className="h-10 w-10 stroke-[1.5px] text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />,
        }
      case "conditional_approval":
        return {
          bg: "bg-orange-500/10 border-orange-500/60 text-[#1F2937] shadow-[0_0_20px_rgba(249,115,22,0.15)]",
          badge: "conditional" as const,
          icon: (
            <AlertTriangle className="h-10 w-10 stroke-[1.5px] text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          ),
        }
      default:
        return {
          bg: "bg-yellow-500/10 border-yellow-500/60 text-[#1F2937]",
          badge: "review" as const,
          icon: <HelpCircle className="h-10 w-10 stroke-[1.5px] text-yellow-500" />,
        }
    }
  }

  const getSeverityVariant = (sev: string) => {
    switch (sev) {
      case "critical":
        return "critical"
      case "high":
        return "high"
      case "medium":
        return "medium"
      case "low":
        return "low"
      default:
        return "info"
    }
  }

  const getVerdictVariant = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case "approve":
      case "approved":
        return "approved"
      case "reject":
      case "rejected":
        return "rejected"
      case "conditional_approval":
      case "conditional":
        return "conditional"
      default:
        return "review"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#FAF8F5] font-mono text-[#1F2937] text-xs">
        <Loader2 className="h-8 w-8 animate-spin text-[#1F2937]" />
        RETRIEVING AUDIT TRAIL FROM DATABASE...
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#FAF8F5] p-6 text-center text-[#1F2937]">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="font-bold font-sans text-xl">Failed to load Governance Record</h2>
        <p className="max-w-md font-mono text-[#1F2937]/60 text-xs">{error || "Record not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 rounded-[20px] bg-[#1F2937] px-4 py-2 font-bold font-mono text-[#FAF8F5] text-xs uppercase transition-colors hover:bg-[#38B0E8]"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  const verdictConfig = getVerdictStyle(record.verdict)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  }

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] pb-24 font-sans text-[#1F2937]">
      {/* Background Retrotech Grid Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Decorative Grid Margins with Crosshairs */}
      <div className="pointer-events-none fixed top-16 right-6 bottom-6 left-6 z-0 border border-[#C7C7C7]/30">
        <span className="absolute -top-3.5 -left-1.5 select-none font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -top-3.5 -right-1.5 select-none font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -bottom-3.5 -left-1.5 select-none font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -right-1.5 -bottom-3.5 select-none font-mono text-[#C7C7C7] text-sm">+</span>
      </div>

      {/* Global Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-[#C7C7C7] border-b bg-[#FAF8F5]/80 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1F2937] text-[#76E1A7]">
            <Database className="h-4 w-4" />
          </div>
          <span className="font-black font-sans text-[#1F2937] text-lg uppercase tracking-tight">THE AI CHARTER</span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="font-bold font-mono text-[#38B0E8] text-xs uppercase transition-colors hover:text-[#1F2937]"
        >
          Return to Dashboard
        </button>
      </header>

      {/* Main Record Area */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-12">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">
          {/* Page Title & ID banner - Dark Mode Command Center Style */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between gap-4 overflow-hidden rounded-xl border border-[#C7C7C7]/20 bg-[#1F2937] p-8 shadow-2xl sm:flex-row sm:items-center relative"
          >
            {/* Subtle glow behind dark card */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#76E1A7]/5 to-[#38B0E8]/5 opacity-50" />

            <div className="relative z-10">
              <h1 className="font-black font-sans text-3xl text-[#FAF8F5] uppercase tracking-tight drop-shadow-sm">
                {record.featureName}
              </h1>
              <p className="mt-2 flex items-center gap-2 font-bold font-mono text-[#76E1A7] text-[10px] uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#76E1A7] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#76E1A7]"></span>
                </span>
                Governance Audit Session Record
              </p>
            </div>
            <div className="relative z-10 text-left font-mono text-xs sm:text-right">
              <span className="block text-[#C7C7C7]/60 uppercase tracking-widest">AUDIT TRAIL REFERENCE</span>
              <span className="mt-1 block font-bold text-[#A1DFF5] text-lg tracking-wider drop-shadow-sm">
                {record.referenceId}
              </span>
            </div>
          </motion.div>

          {/* 1. Verdict Showcase Block */}
          <motion.div variants={itemVariants}>
            <Card
              className={`relative flex flex-col items-center gap-6 overflow-hidden rounded-xl border-2 p-8 transition-shadow duration-500 md:flex-row ${verdictConfig.bg}`}
            >
              {/* Glassy sheen */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

              <div className="relative z-10 shrink-0">{verdictConfig.icon}</div>
              <div className="relative z-10 flex-1 space-y-3 text-center md:text-left">
                <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:justify-start">
                  <span className="font-bold font-mono text-[#1F2937]/70 text-xs uppercase tracking-widest">
                    CONCENSUS VERDICT:
                  </span>
                  <Badge variant={verdictConfig.badge} className="px-3 py-1 text-sm shadow-sm">
                    {record.verdict.replace(/_/g, " ")}
                  </Badge>
                </div>

                {record.conditions && record.conditions.length > 0 ? (
                  <div className="pt-2">
                    <div className="mb-2 font-bold font-mono text-[#1F2937]/80 text-[10px] uppercase tracking-widest">
                      MANDATORY RELEASE CONDITIONS:
                    </div>
                    <ul className="list-inside list-disc space-y-1.5 font-sans font-semibold text-[#1F2937]/90 text-sm">
                      {record.conditions.map((cond) => (
                        <li key={cond}>{cond}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="font-sans font-bold text-[#1F2937]/90 text-base leading-snug">
                    {record.verdict === "approved"
                      ? "This feature matches all standard governance requirements and is cleared for release."
                      : "This feature has been flagged for human review or rejected. Release path blocked."}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* 2. Asymmetric Blueprint Grid (Original Submission Payload) */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-widest">
              Proposal Specs & Risk Profile
            </h3>

            <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-[#C7C7C7]/80 bg-[#FAF8F5] shadow-sm font-sans text-xs md:grid-cols-3">
              {/* Left Parameters */}
              <div className="space-y-6 border-[#C7C7C7]/50 border-r bg-[#1F2937]/5 p-6">
                <div className="space-y-1.5">
                  <span className="block font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                    Feature Type
                  </span>
                  <span className="block font-bold font-mono text-sm uppercase text-[#1F2937]">
                    {record.submission.featureType.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="block font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                    PII Involved
                  </span>
                  <span className="block font-bold font-mono text-sm uppercase text-[#1F2937]">
                    {record.submission.piiInvolved}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="block font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                    Affected Systems
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {record.submission.affectedSystems.map((sys) => (
                      <span
                        key={sys}
                        className="rounded-md border border-[#1F2937]/20 bg-white px-2 py-1 font-mono text-[10px] font-bold text-[#1F2937]"
                      >
                        {sys}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="block font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                    Target Jurisdictions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {record.submission.jurisdiction.map((j) => (
                      <span
                        key={j}
                        className="rounded-md border border-[#1F2937]/20 bg-white px-2 py-1 font-mono text-[10px] font-bold text-[#1F2937]"
                      >
                        {j}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Parameters */}
              <div className="space-y-6 p-6 md:col-span-2 bg-white/50 backdrop-blur-sm">
                <div className="space-y-2">
                  <span className="block font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                    Description
                  </span>
                  <p className="text-[#1F2937]/80 leading-relaxed font-medium text-sm">
                    {record.submission.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="block font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                    Intended Use
                  </span>
                  <p className="text-[#1F2937]/80 leading-relaxed font-medium text-sm">
                    {record.submission.intendedUse}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="block font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                    Data Sources
                  </span>
                  <p className="text-[#1F2937]/80 leading-relaxed font-medium text-sm">
                    {record.submission.dataSources}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. Detailed Agent Votes & Findings (Collapsibles) */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-widest">
              Agent Ballots & Reasoning
            </h3>

            <div className="space-y-3">
              {record.agentRecords.map((agent) => {
                const hasFindings = agent.findings && agent.findings.length > 0

                const titleElement = (
                  <div className="flex w-full flex-wrap items-center justify-between gap-4 pr-4 font-sans text-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F2937]/5 text-lg"
                        role="img"
                        aria-label={agent.name}
                      >
                        {agent.emoji}
                      </span>
                      <span className="font-bold text-[#1F2937] tracking-tight">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-xs">
                      <Badge variant={getVerdictVariant(agent.vote)} className="shadow-sm">
                        {agent.vote}
                      </Badge>
                      <div className="flex items-center gap-2 text-[#1F2937]/50 uppercase">
                        <span className="font-bold text-[10px] tracking-widest">CONFIDENCE:</span>
                        <span className="font-black text-[#1F2937]">{agent.confidence}</span>
                        <ConfidenceMeter level={agent.confidence} />
                      </div>
                    </div>
                  </div>
                )

                return (
                  <motion.div
                    key={agent.agentId}
                    whileHover={{ scale: 1.005 }}
                    transition={{ type: "tween", duration: 0.2 }}
                  >
                    <Collapsible
                      title={titleElement}
                      className="rounded-xl border border-[#C7C7C7]/60 bg-white shadow-sm transition-colors hover:border-[#1F2937]/20"
                    >
                      <div className="space-y-5 px-1 py-2">
                        {/* Reasoning text */}
                        <div>
                          <div className="mb-2 font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                            Reasoning Statement
                          </div>
                          <p className="whitespace-pre-wrap font-medium font-sans text-[#1F2937]/80 text-sm leading-relaxed">
                            {agent.reasoning}
                          </p>
                        </div>

                        {/* Agent Findings */}
                        {hasFindings && (
                          <div className="space-y-3 border-[#C7C7C7]/30 border-t pt-5">
                            <div className="font-bold font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
                              Findings Identified ({agent.findings.length})
                            </div>
                            <div className="space-y-3">
                              {agent.findings.map((finding) => (
                                <div
                                  key={finding.id}
                                  className="space-y-2 rounded-lg border border-[#C7C7C7]/50 bg-[#FAF8F5]/50 p-4 transition-colors hover:border-[#C7C7C7]"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
                                      {finding.title}
                                    </span>
                                    <Badge variant={getSeverityVariant(finding.severity)}>{finding.severity}</Badge>
                                  </div>
                                  <p className="font-sans font-medium text-[#1F2937]/80 text-sm leading-relaxed">
                                    {finding.detail}
                                  </p>
                                  {finding.recommendation && (
                                    <div className="mt-2 flex items-start gap-2 rounded-md bg-[#76E1A7]/10 p-3 font-sans font-semibold text-[#1F2937] text-sm">
                                      <span className="text-[#12B364]">▸</span>
                                      <span>Recommendation: {finding.recommendation}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Collapsible>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* 4. Adversarial Cross-Examination Logs */}
          {record.crossExaminationLog && record.crossExaminationLog.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-widest">
                Adversarial Cross-Examination Logs
              </h3>

              <Card className="space-y-8 rounded-xl border border-[#C7C7C7]/80 bg-white p-8 shadow-sm">
                {record.crossExaminationLog.map((log, idx) => (
                  <div
                    key={`${log.timestamp}-${log.fromAgent}-${idx}`}
                    className="relative space-y-4 border-[#C7C7C7]/50 border-l-2 pb-8 pl-8 last:pb-0 last:border-transparent"
                  >
                    {/* Timeline bullet */}
                    <span className="absolute top-1.5 -left-[9px] flex h-4 w-4 select-none items-center justify-center rounded-full border-[3px] border-white bg-[#1F2937] shadow-sm"></span>

                    <div className="flex items-center justify-between gap-4 font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-2 font-bold text-[#1F2937]">
                        <span className="rounded bg-[#1F2937]/5 px-1.5 py-0.5">{log.fromAgent}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#C7C7C7]" />
                        <span className="rounded bg-[#1F2937]/5 px-1.5 py-0.5">{log.toAgent}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 font-sans text-sm md:grid-cols-2">
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 shadow-sm">
                        <div className="mb-2 font-bold font-mono text-red-500/70 text-[10px] uppercase tracking-widest">
                          Challenge Posted
                        </div>
                        <p className="font-semibold text-[#1F2937]/90 leading-relaxed text-sm">"{log.challenge}"</p>
                      </div>
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 shadow-sm">
                        <div className="mb-2 font-bold font-mono text-blue-500/70 text-[10px] uppercase tracking-widest">
                          Counter Position / Response
                        </div>
                        <p className="font-medium text-[#1F2937]/80 leading-relaxed text-sm">"{log.counterPosition}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            </motion.div>
          )}

          {/* 5. Document Stamp details */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-between gap-4 border-[#C7C7C7]/40 border-t-2 pt-8 font-mono text-[#1F2937]/50 text-[10px] sm:flex-row tracking-widest"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                SESSION RUN TIME: {new Date(record.createdAt).toLocaleTimeString()} -{" "}
                {new Date(record.completedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>DISTRIBUTED GOVERNANCE NODE STAMP</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
