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
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Collapsible } from "@/components/ui/Collapsible"
import { getGovernanceRecord } from "@/lib/api"
import type { GovernanceRecord } from "@/types/charter"

export default function RecordViewer() {
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
          bg: "bg-[#76E1A7]/10 border-[#76E1A7] text-[#1F2937]",
          badge: "approved" as const,
          icon: <CheckCircle className="h-10 w-10 stroke-[1.5px] text-[#76E1A7]" />,
        }
      case "rejected":
        return {
          bg: "bg-red-500/10 border-red-500 text-[#1F2937]",
          badge: "rejected" as const,
          icon: <XCircle className="h-10 w-10 stroke-[1.5px] text-red-500" />,
        }
      case "conditional_approval":
        return {
          bg: "bg-orange-500/10 border-orange-500 text-[#1F2937]",
          badge: "conditional" as const,
          icon: <AlertTriangle className="h-10 w-10 stroke-[1.5px] text-orange-400" />,
        }
      default:
        return {
          bg: "bg-yellow-500/10 border-yellow-500 text-[#1F2937]",
          badge: "review" as const,
          icon: <HelpCircle className="h-10 w-10 stroke-[1.5px] text-yellow-400" />,
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
          className="mt-4 rounded-[20px] bg-[#1F2937] px-4 py-2 font-bold font-mono text-[#FAF8F5] text-xs uppercase"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  const verdictConfig = getVerdictStyle(record.verdict)

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] pb-16 font-sans text-[#1F2937]">
      {/* Background Retrotech Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Decorative Grid Margins with Crosshairs */}
      <div className="pointer-events-none absolute top-16 right-6 bottom-6 left-6 z-0 border border-[#C7C7C7]/30">
        <span className="absolute -top-3.5 -left-1.5 select-none font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -top-3.5 -right-1.5 select-none font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -bottom-3.5 -left-1.5 select-none font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -right-1.5 -bottom-3.5 select-none font-mono text-[#C7C7C7] text-sm">+</span>
      </div>

      {/* Global Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-[#C7C7C7] border-b bg-[#FAF8F5]/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1F2937] text-[#76E1A7]">
            <Database className="h-4 w-4" />
          </div>
          <span className="font-black font-sans text-[#1F2937] text-lg uppercase tracking-tight">THE AI CHARTER</span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="font-bold font-mono text-[#38B0E8] text-xs uppercase hover:underline"
        >
          Return to Dashboard
        </button>
      </header>

      {/* Main Record Area */}
      <main className="relative z-10 mx-auto max-w-5xl space-y-8 px-6 pt-12">
        {/* Page Title & ID banner */}
        <div className="flex flex-col justify-between gap-4 border-[#C7C7C7] border-b pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-black font-sans text-2xl text-[#1F2937] uppercase tracking-tight">
              {record.featureName}
            </h1>
            <p className="mt-1 font-mono text-[#1F2937]/50 text-[10px] uppercase">Governance Audit Session Record</p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="block text-[#1F2937]/50 uppercase">AUDIT TRAIL REFERENCE</span>
            <span className="font-bold text-[#1F2937] tracking-wider">{record.referenceId}</span>
          </div>
        </div>

        {/* 1. Verdict Showcase Block */}
        <Card className={`flex flex-col items-center gap-6 border-2 p-6 md:flex-row ${verdictConfig.bg}`}>
          <div className="shrink-0">{verdictConfig.icon}</div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <span className="font-bold font-mono text-[#1F2937]/60 text-xs uppercase tracking-wider">
                CONCENSUS VERDICT:
              </span>
              <Badge variant={verdictConfig.badge}>{record.verdict.replace(/_/g, " ")}</Badge>
            </div>

            {record.conditions && record.conditions.length > 0 ? (
              <div className="pt-2">
                <div className="mb-1.5 font-bold font-mono text-[#1F2937]/70 text-[10px] uppercase">
                  MANDATORY RELEASE CONDITIONS:
                </div>
                <ul className="list-inside list-disc space-y-1 font-sans font-semibold text-[#1F2937] text-xs">
                  {record.conditions.map((cond) => (
                    <li key={cond}>{cond}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="font-sans font-semibold text-[#1F2937] text-sm">
                {record.verdict === "approved"
                  ? "This feature matches all standard governance requirements and is cleared for release."
                  : "This feature has been flagged for human review or rejected. Release path blocked."}
              </p>
            )}
          </div>
        </Card>

        {/* 2. Asymmetric Blueprint Grid (Original Submission Payload) */}
        <div className="space-y-4">
          <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
            Proposal Specs & Risk Profile
          </h3>

          <div className="grid grid-cols-1 overflow-hidden rounded-md border border-[#C7C7C7] bg-[#FAF8F5] font-sans text-xs md:grid-cols-3">
            {/* Left Parameters */}
            <div className="space-y-4 border-[#C7C7C7] border-r bg-[#FAF8F5]/30 p-5">
              <div className="space-y-1">
                <span className="block font-mono text-[#1F2937]/50 text-[10px] uppercase">Feature Type</span>
                <span className="font-mono font-semibold uppercase">
                  {record.submission.featureType.replace(/_/g, " ")}
                </span>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[#1F2937]/50 text-[10px] uppercase">PII Involved</span>
                <span className="font-mono font-semibold uppercase">{record.submission.piiInvolved}</span>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[#1F2937]/50 text-[10px] uppercase">Affected Systems</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {record.submission.affectedSystems.map((sys) => (
                    <span
                      key={sys}
                      className="rounded-[4px] border border-[#C7C7C7] bg-[#FAF8F5] px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {sys}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[#1F2937]/50 text-[10px] uppercase">Target Jurisdictions</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {record.submission.jurisdiction.map((j) => (
                    <span
                      key={j}
                      className="rounded-[4px] border border-[#C7C7C7] bg-[#FAF8F5] px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {j}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Parameters */}
            <div className="space-y-4 border-[#C7C7C7] border-r p-5 md:col-span-2">
              <div className="space-y-1">
                <span className="block font-mono text-[#1F2937]/50 text-[10px] uppercase">Description</span>
                <p className="text-[#1F2937]/80 leading-relaxed">{record.submission.description}</p>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[#1F2937]/50 text-[10px] uppercase">Intended Use</span>
                <p className="text-[#1F2937]/80 leading-relaxed">{record.submission.intendedUse}</p>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[#1F2937]/50 text-[10px] uppercase">Data Sources</span>
                <p className="text-[#1F2937]/80 leading-relaxed">{record.submission.dataSources}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Detailed Agent Votes & Findings (Collapsibles) */}
        <div className="space-y-4">
          <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
            Agent Ballots & Reasoning
          </h3>

          <div className="space-y-4">
            {record.agentRecords.map((agent) => {
              const hasFindings = agent.findings && agent.findings.length > 0

              const titleElement = (
                <div className="flex w-full flex-wrap items-center justify-between gap-4 pr-4 font-sans text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={agent.name}>
                      {agent.emoji}
                    </span>
                    <span className="font-bold text-[#1F2937]">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <Badge variant={getVerdictVariant(agent.vote)}>{agent.vote}</Badge>
                    <span className="text-[#1F2937]/50 uppercase">
                      CONFIDENCE: <span className="font-bold text-[#1F2937]">{agent.confidence}</span>
                    </span>
                  </div>
                </div>
              )

              return (
                <Collapsible key={agent.agentId} title={titleElement} className="border border-[#C7C7C7]/60">
                  <div className="space-y-4">
                    {/* Reasoning text */}
                    <div>
                      <div className="mb-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">Reasoning Statement</div>
                      <p className="whitespace-pre-wrap font-medium font-sans text-[#1F2937]/80 text-xs leading-relaxed">
                        {agent.reasoning}
                      </p>
                    </div>

                    {/* Agent Findings */}
                    {hasFindings && (
                      <div className="space-y-3 border-[#C7C7C7]/40 border-t pt-4">
                        <div className="font-mono text-[#1F2937]/50 text-[9px] uppercase">
                          Findings Identified ({agent.findings.length})
                        </div>
                        <div className="space-y-3">
                          {agent.findings.map((finding) => (
                            <div
                              key={finding.id}
                              className="space-y-1.5 rounded border border-[#C7C7C7] bg-[#FAF8F5] p-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold font-mono text-[#1F2937] text-xs">{finding.title}</span>
                                <Badge variant={getSeverityVariant(finding.severity)}>{finding.severity}</Badge>
                              </div>
                              <p className="font-sans text-[#1F2937]/70 text-xs leading-relaxed">{finding.detail}</p>
                              {finding.recommendation && (
                                <div className="flex items-start gap-1 font-sans font-semibold text-[#1F2937] text-xs">
                                  <span className="text-[#76E1A7]">▸</span>
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
              )
            })}
          </div>
        </div>

        {/* 4. Adversarial Cross-Examination Logs */}
        {record.crossExaminationLog && record.crossExaminationLog.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
              Adversarial Cross-Examination Logs
            </h3>

            <Card className="space-y-6 border border-[#C7C7C7] bg-[#FAF8F5] p-6">
              {record.crossExaminationLog.map((log, idx) => (
                <div
                  key={`${log.timestamp}-${log.fromAgent}-${idx}`}
                  className="relative space-y-3 border-[#C7C7C7] border-l pb-6 pl-6 last:pb-0"
                >
                  {/* Timeline bullet */}
                  <span className="absolute top-1.5 -left-1.5 flex h-3.5 w-3.5 select-none items-center justify-center rounded-full border-2 border-[#FAF8F5] bg-[#1F2937] font-bold font-mono text-[#76E1A7] text-[9px]">
                    +
                  </span>

                  <div className="flex items-center justify-between gap-4 font-mono text-[#1F2937]/50 text-[10px] uppercase">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-[#1F2937]">
                      {log.fromAgent} <ArrowRight className="h-3 w-3" /> {log.toAgent}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 font-sans text-xs md:grid-cols-2">
                    <div className="rounded border border-[#C7C7C7]/50 bg-[#FAF8F5]/30 p-3">
                      <div className="mb-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">Challenge Posted</div>
                      <p className="font-semibold text-[#1F2937]/80 italic leading-relaxed">"{log.challenge}"</p>
                    </div>
                    <div className="rounded border border-[#C7C7C7]/50 bg-[#FAF8F5]/30 p-3">
                      <div className="mb-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">
                        Counter Position / Response
                      </div>
                      <p className="text-[#1F2937]/80 leading-relaxed">"{log.counterPosition}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* 5. Document Stamp details */}
        <div className="flex flex-col items-center justify-between gap-4 border-[#C7C7C7] border-t pt-6 font-mono text-[#1F2937]/50 text-[10px] sm:flex-row">
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
        </div>
      </main>
    </div>
  )
}
