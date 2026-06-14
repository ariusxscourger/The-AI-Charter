"use client"

import {
  Activity,
  ArrowRight,
  Calendar,
  Cpu,
  Database,
  FileCheck,
  FileText,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/context/AuthContext"
import { getHistoricalRecords } from "@/lib/api"
import type { GovernanceRecord } from "@/types/charter"

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth()
  const [records, setRecords] = useState<GovernanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterVerdict, setFilterVerdict] = useState<string>("all")

  useEffect(() => {
    if (!user) return
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
  }, [user])

  const agentConfig = [
    {
      name: "Ethics Agent",
      emoji: "⚖️",
      focus: "Fairness, bias, values alignment",
      detail: "Ensures model outputs do not project bias or violate core ethical standards.",
    },
    {
      name: "Security Agent",
      emoji: "🔒",
      focus: "Attack surface, data abuse",
      detail: "Checks code transit paths, PII exposure, and sandbox environments.",
    },
    {
      name: "Legal Agent",
      emoji: "📜",
      focus: "IP, regulation, compliance",
      detail: "Scans for copyright risk, jurisdictional liabilities, and terms of use.",
    },
    {
      name: "Product Agent",
      emoji: "🚀",
      focus: "UX impact, business alignment",
      detail: "Verifies deployment goals, UX frictions, and metric integrations.",
    },
    {
      name: "Compliance Agent",
      emoji: "✅",
      focus: "GDPR, SOC2, policy targets",
      detail: "Compares telemetry logs against GDPR, CCPA, and internal guidelines.",
    },
  ]

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

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.referenceId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVerdict = filterVerdict === "all" || rec.verdict === filterVerdict
    return matchesSearch && matchesVerdict
  })

  // Calculate metrics
  const totalAudits = records.length
  const approvedCount = records.filter((r) => r.verdict === "approved").length

  if (authLoading) {
    return (
      <div className="relative flex min-h-screen select-none flex-col items-center justify-center bg-[#FAF8F5] font-sans text-[#1F2937]">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 rounded border border-[#C7C7C7] bg-[#FAF8F5] p-10 text-center shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#1F2937]" />
          <span className="font-mono text-[#1F2937]/70 text-xs uppercase tracking-widest">
            CONNECTING TO OPERATOR GRID...
          </span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return (
    <div className="relative min-h-screen select-none bg-[#FAF8F5] pb-20 font-sans text-[#1F2937]">
      {/* Background Retrotech Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Outer Layout Frame border intersected by light gray crosshairs (+) */}
      <div className="pointer-events-none absolute top-16 right-6 bottom-6 left-6 z-0 border border-[#C7C7C7]">
        <span className="absolute -top-3.5 -left-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -top-3.5 -right-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -bottom-3.5 -left-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">
          +
        </span>
        <span className="absolute -right-1.5 -bottom-3.5 select-none font-black font-mono text-[#C7C7C7] text-sm">
          +
        </span>
      </div>

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-[#C7C7C7] border-b bg-[#FAF8F5]/90 px-8 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F2937] text-[#76E1A7] shadow-[0_0_10px_rgba(118,225,167,0.4)]">
            <Database className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold font-sans text-[#1F2937] text-xl uppercase tracking-tight">
            THE AI CHARTER
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="hidden text-[#1F2937]/60 sm:inline-block">
              OPERATOR NODE: <span className="font-bold text-[#1F2937]">{user.email}</span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer rounded-[20px] border border-[#1F2937] px-3.5 py-1.5 font-bold text-[10px] uppercase tracking-wider transition-all hover:bg-[#1F2937] hover:text-[#FAF8F5]"
            >
              DISCONNECT
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 pt-8 lg:grid-cols-3">
        {/* Left 2 Columns: Main Hub */}
        <div className="space-y-8 lg:col-span-2">
          {/* Hero Banner Section */}
          <div className="relative overflow-hidden rounded-lg border border-[#C7C7C7] bg-[#1F2937] p-8 text-[#FAF8F5] shadow-xl">
            {/* Background glowing indicator */}
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

          {/* Metrics Panel */}
          <div className="grid grid-cols-3 overflow-hidden rounded-md border border-[#C7C7C7] bg-[#FAF8F5]">
            <div className="space-y-1 border-[#C7C7C7] border-r p-5">
              <span className="block flex items-center gap-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">
                <Activity className="h-3 w-3 text-[#38B0E8]" />
                Proposals Audited
              </span>
              <span className="font-black font-sans text-2xl text-[#1F2937] tracking-tight">{totalAudits}</span>
            </div>

            <div className="space-y-1 border-[#C7C7C7] border-r p-5">
              <span className="block flex items-center gap-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">
                <FileCheck className="h-3 w-3 text-[#76E1A7]" />
                Approved Verdicts
              </span>
              <span className="font-black font-sans text-2xl text-[#1F2937] tracking-tight">{approvedCount}</span>
            </div>

            <div className="space-y-1 p-5">
              <span className="block flex items-center gap-1 font-mono text-[#1F2937]/50 text-[9px] uppercase">
                <Users className="h-3 w-3 text-red-400" />
                Active Agents
              </span>
              <span className="font-black font-sans text-2xl text-[#1F2937] tracking-tight">5 Connected</span>
            </div>
          </div>

          {/* Governance Pipeline showcase */}
          <div className="space-y-4">
            <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
              Governance Process Lifecycle
            </h3>

            <div className="grid grid-cols-1 gap-4 font-mono text-[10px] sm:grid-cols-4">
              <div className="relative rounded border border-[#C7C7C7]/60 bg-[#FAF8F5] p-4">
                <div className="mb-1 font-bold text-[#38B0E8]">01. SUBMISSION</div>
                <p className="text-[#1F2937]/60 text-[9px] leading-normal">
                  Submit features specs, data sources, and risk profiles.
                </p>
                <ArrowRight className="absolute right-2 bottom-2 hidden h-3 w-3 text-[#C7C7C7] sm:block" />
              </div>
              <div className="relative rounded border border-[#C7C7C7]/60 bg-[#FAF8F5] p-4">
                <div className="mb-1 font-bold text-[#76E1A7]">02. EVALUATION</div>
                <p className="text-[#1F2937]/60 text-[9px] leading-normal">
                  5 specialized agents independently write findings in parallel.
                </p>
                <ArrowRight className="absolute right-2 bottom-2 hidden h-3 w-3 text-[#C7C7C7] sm:block" />
              </div>
              <div className="relative rounded border border-[#C7C7C7]/60 bg-[#FAF8F5] p-4">
                <div className="mb-1 font-bold text-[#A1DFF5]">03. ADVERSARIAL</div>
                <p className="text-[#1F2937]/60 text-[9px] leading-normal">
                  Agents challenge peer conclusions inside the Band room.
                </p>
                <ArrowRight className="absolute right-2 bottom-2 hidden h-3 w-3 text-[#C7C7C7] sm:block" />
              </div>
              <div className="rounded border border-[#C7C7C7]/60 bg-[#FAF8F5] p-4">
                <div className="mb-1 font-bold text-[#1F2937]">04. IMMUTABLE RECORD</div>
                <p className="text-[#1F2937]/60 text-[9px] leading-normal">
                  Record compiled from room transcript and saved to Postgres.
                </p>
              </div>
            </div>
          </div>

          {/* Specialized Agents Grid */}
          <div className="space-y-4">
            <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">The Agent Panel</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {agentConfig.map((agent) => (
                <Card key={agent.name} className="flex gap-4 border border-[#C7C7C7]/50 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1F2937] text-2xl">
                    {agent.emoji}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold font-mono text-[#1F2937] text-sm uppercase tracking-tight">
                      {agent.name}
                    </h4>
                    <span className="block font-mono font-semibold text-[#38B0E8] text-[9px] uppercase">
                      {agent.focus}
                    </span>
                    <p className="pt-1 text-[#1F2937]/60 text-[11px] leading-relaxed">{agent.detail}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Historical Ledgers */}
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

          {/* Search and Filters panel */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or reference ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded border border-[#C7C7C7] bg-[#FAF8F5] pr-3 pl-9 font-mono text-[#1F2937] text-xs placeholder-[#C7C7C7] transition-all focus:border-[#1F2937] focus:ring-1 focus:ring-[#76E1A7]/30"
              />
              <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-[#C7C7C7]" />
            </div>

            <div className="flex gap-1.5 font-mono text-[9px]">
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
                  className={`cursor-pointer rounded-md border px-2.5 py-1 font-bold uppercase transition-all ${
                    filterVerdict === btn.value
                      ? "border-[#1F2937] bg-[#1F2937] text-[#FAF8F5]"
                      : "border-[#C7C7C7]/60 text-[#1F2937]/60 hover:border-[#1F2937]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Ledger lists */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 font-mono text-[#1F2937]/50 text-xs">
                <Loader2 className="h-5 w-5 animate-spin text-[#1F2937]" />
                RETRIEVING AUDIT TRAILS...
              </div>
            ) : filteredRecords.length === 0 ? (
              <Card className="flex flex-col items-center justify-center border border-[#C7C7C7]/50 py-16 text-center">
                <FileText className="mb-3 h-8 w-8 text-[#C7C7C7]" />
                <p className="font-mono text-[#1F2937]/50 text-xs uppercase">No matching ledgers</p>
              </Card>
            ) : (
              <div className="max-h-[600px] space-y-4 overflow-y-auto pr-1">
                {filteredRecords.map((record) => (
                  <Link href={`/record/${record.sessionId}`} key={record.sessionId} className="group block">
                    <Card className="border border-[#C7C7C7]/60 py-4 transition-all group-hover:border-[#1F2937]">
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
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function LandingPage() {
  const [terminalStep, setTerminalStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTerminalStep((prev) => (prev + 1) % 9)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    {
      text: "SYSTEM [12:00:01] Initializing evaluation for 'LLM Auto-Reconciliation Engine'...",
      color: "text-[#FAF8F5]/40",
    },
    {
      text: "⚖️ Ethics Agent [12:00:03] CHECK: Analyzing fairness constraints. No major bias issues found. [VOTE: APPROVED]",
      color: "text-[#76E1A7]/90",
    },
    {
      text: "🔒 Security Agent [12:00:05] WARNING! Direct database queries detected in data pipeline. SQL injection risk! [VOTE: REJECTED]",
      color: "text-red-400 font-bold",
    },
    {
      text: "📜 Legal Agent [12:00:07] CHECK: Scanning for copyright risk. IP exposure is within threshold. [VOTE: APPROVED]",
      color: "text-[#76E1A7]/90",
    },
    {
      text: "✅ Compliance Agent [12:00:09] CHECK: Verifying SOC2 / GDPR telemetry storage compliance. Approved. [VOTE: APPROVED]",
      color: "text-[#76E1A7]/90",
    },
    {
      text: "🚀 Product Agent [12:00:11] CHECK: Metric parameters checked. UX limits are satisfactory. [VOTE: APPROVED]",
      color: "text-[#76E1A7]/90",
    },
    {
      text: "🔒 Security Agent [12:00:15] Challenge to Product Agent: Propose conditional approval if auto-reconciliation runs in isolated sandbox runtime.",
      color: "text-[#A1DFF5]",
    },
    {
      text: "🚀 Product Agent [12:00:18] Response to Security Agent: Agreed. Enforcing sandbox runtime resolves UX-critical performance risks.",
      color: "text-[#FAF8F5]/80",
    },
    {
      text: "SYSTEM [12:00:22] Consensus reached. Verdict: CONDITIONAL_APPROVAL (Sandbox runtime enforced). Record generated.",
      color: "text-[#76E1A7] font-black underline",
    },
  ]

  const agentDetails = [
    {
      name: "Ethics Agent",
      focus: "⚖️ Bias & Fair Alignment",
      desc: "Monitors token biases, toxicity parameters, and socio-ethical impact vectors.",
      provider: "Featherless.ai",
    },
    {
      name: "Security Agent",
      focus: "🔒 Threat & Sandbox Isolation",
      desc: "Audits vulnerability surfaces, sandboxed runs, PII leaks, and data sanitization.",
      provider: "Featherless.ai",
    },
    {
      name: "Legal Agent",
      focus: "📜 IP & Compliance Liability",
      desc: "Validates copyright exposure, license parameters, and software constraints.",
      provider: "Featherless.ai",
    },
    {
      name: "Product Agent",
      focus: "🚀 Product & Metric Alignment",
      desc: "Analyzes system overhead, latency constraints, and product feedback loops.",
      provider: "AI/ML API",
    },
    {
      name: "Compliance Agent",
      focus: "✅ Policy & Regulation (SOC2)",
      desc: "Enforces GDPR safeguards, audit capabilities, telemetry compliance, and data policies.",
      provider: "AI/ML API",
    },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAF8F5] pb-24 font-sans text-[#1F2937]">
      {/* Retrotech background grid */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Decorative Border Frame with Crosshairs */}
      <div className="pointer-events-none absolute top-16 right-6 bottom-6 left-6 z-0 border border-[#C7C7C7]">
        <span className="absolute -top-3.5 -left-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -top-3.5 -right-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -bottom-3.5 -left-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">
          +
        </span>
        <span className="absolute -right-1.5 -bottom-3.5 select-none font-black font-mono text-[#C7C7C7] text-sm">
          +
        </span>
      </div>

      {/* Global Landing Navigation */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-[#C7C7C7] border-b bg-[#FAF8F5]/90 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F2937] text-[#76E1A7] shadow-[0_0_10px_rgba(118,225,167,0.4)]">
            <Database className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold font-sans text-[#1F2937] text-xl uppercase tracking-tight">
            THE AI CHARTER
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="mr-4 hidden items-center gap-3 font-mono text-[#1F2937]/50 text-[10px] uppercase md:flex">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#76E1A7]" />
            GRID STATUS: OPERATIONAL
          </div>
          <Link
            href="/login"
            className="rounded-[20px] border border-[#1F2937] px-4 py-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider transition-all hover:bg-[#1F2937] hover:text-[#FAF8F5]"
          >
            DISCONNECT / CONNECT NODE
          </Link>
        </div>
      </header>

      {/* Hero Section & Interactive Terminal Console */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-8 pt-12 lg:grid-cols-12 lg:pt-16">
        {/* Hero Copy */}
        <div className="space-y-6 pt-4 lg:col-span-5">
          <div className="inline-flex items-center gap-2 rounded border border-[#C7C7C7] bg-[#1F2937] px-3 py-1 font-bold font-mono text-[#76E1A7] text-[9px] uppercase tracking-wider">
            <Cpu className="h-3.5 w-3.5" /> Track 3: Regulated & High-Stakes Workflows
          </div>
          <h1 className="font-black font-sans text-4xl text-[#1F2937] uppercase leading-[0.95] tracking-tight lg:text-5xl">
            COLLABORATIVE MULTI-AGENT GOVERNANCE
          </h1>
          <p className="max-w-md text-[#1F2937]/70 text-sm leading-relaxed">
            The AI Charter reviews proposed AI features before release. Five specialized, autonomous agents debate
            ethics, security, compliance, legal liability, and product constraints inside a secure Band.ai room to
            establish a transparent, audit-hardened release ledger.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/signup"
              className="flex h-11 cursor-pointer items-center gap-2 rounded-[22px] border border-[#1F2937]/10 bg-[#76E1A7] px-6 font-black text-[#1F2937] text-xs uppercase tracking-wider transition-all hover:bg-[#8BF5BD] hover:shadow-[0_0_15px_rgba(118,225,167,0.5)]"
            >
              INITIALIZE OPERATOR NODE <ArrowRight className="h-4 w-4 stroke-[3px]" />
            </Link>
          </div>
        </div>

        {/* Live Terminal Preview */}
        <div className="w-full lg:col-span-7">
          <div className="overflow-hidden rounded-lg border border-[#C7C7C7] bg-[#1F2937] text-[#FAF8F5] shadow-2xl">
            {/* Terminal Window Chrome */}
            <div className="flex items-center justify-between border-[#C7C7C7]/20 border-b bg-[#171E29] px-4 py-2">
              <div className="flex gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-[#FAF8F5]/40 text-[10px] tracking-wider">
                band-room://session-simulation-active
              </span>
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-[#76E1A7]" />
            </div>

            {/* Terminal Body */}
            <div className="scrollbar-thin max-h-[340px] min-h-[340px] space-y-3 overflow-y-auto p-6 font-mono text-xs">
              {steps.slice(0, terminalStep + 1).map((s) => (
                <div
                  key={s.text}
                  className={`${s.color} animate-fade-in border-[#C7C7C7]/10 border-l-2 pl-3 leading-relaxed`}
                >
                  {s.text}
                </div>
              ))}
              <div className="animate-pulse pt-1 text-[#FAF8F5]/30 text-[10px]">❯ [Await agent token broadcast...]</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of the 5 Specialized Agents */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 pt-20">
        <div className="mb-8 border-[#C7C7C7] border-b pb-4">
          <h2 className="font-black font-sans text-2xl text-[#1F2937] uppercase tracking-tight">
            THE FIVE-AGENT GOVERNANCE BOARD
          </h2>
          <p className="mt-1 font-mono text-[#1F2937]/50 text-[10px] uppercase">
            Running specialized system logic with individual LLM provider configurations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {agentDetails.map((agent, i) => (
            <Card
              key={agent.name}
              className="flex flex-col justify-between border border-[#C7C7C7]/60 bg-[#FAF8F5] p-5 transition-all hover:border-[#1F2937]"
            >
              <div className="space-y-3">
                <span className="block font-bold font-mono text-[#38B0E8] text-[10px] uppercase tracking-wider">
                  AGENT 0{i + 1}
                </span>
                <h3 className="font-black font-sans text-[#1F2937] text-lg uppercase tracking-tight">{agent.name}</h3>
                <span className="inline-block rounded bg-[#1F2937] px-2 py-0.5 font-mono font-semibold text-[#76E1A7] text-[9px]">
                  {agent.focus}
                </span>
                <p className="pt-1 text-[#1F2937]/70 text-[11px] leading-relaxed">{agent.desc}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-[#C7C7C7]/40 border-t pt-3 font-mono text-[#1F2937]/50 text-[9px]">
                <span>LLM PROVIDER:</span>
                <span className="font-bold text-[#1F2937]">{agent.provider}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Governance Architecture Flow (Blueprint style) */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 pt-24">
        <div className="mb-8 border-[#C7C7C7] border-b pb-4">
          <h2 className="font-black font-sans text-2xl text-[#1F2937] uppercase tracking-tight">
            ADVERSARIAL PIPELINE ARCHITECTURE
          </h2>
          <p className="mt-1 font-mono text-[#1F2937]/50 text-[10px] uppercase">
            From client-side proposal input to system consensus database compilation
          </p>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded border border-[#C7C7C7] bg-[#FAF8F5] lg:grid-cols-4">
          <div className="space-y-4 border-[#C7C7C7] border-r border-b p-6 lg:border-b-0">
            <span className="font-bold font-mono text-[#38B0E8] text-[10px]">STAGE 01</span>
            <h3 className="font-black font-sans text-[#1F2937] text-base uppercase">SUBMISSION INGESTION</h3>
            <p className="text-[#1F2937]/70 text-xs leading-relaxed">
              Operator node submits feature specs, database integrations, APIs, and PII sensitivity scores through
              Next.js.
            </p>
          </div>

          <div className="space-y-4 border-[#C7C7C7] border-r border-b p-6 lg:border-b-0">
            <span className="font-bold font-mono text-[#76E1A7] text-[10px]">STAGE 02</span>
            <h3 className="font-black font-sans text-[#1F2937] text-base uppercase">PARALLEL LLM ANALYSIS</h3>
            <p className="text-[#1F2937]/70 text-xs leading-relaxed">
              FastAPI launches all 5 agents simultaneously. Each connects to its target LLM pipeline (Featherless/AI-ML)
              to build findings.
            </p>
          </div>

          <div className="space-y-4 border-[#C7C7C7] border-r border-b p-6 lg:border-b-0">
            <span className="font-bold font-mono text-[#A1DFF5] text-[10px]">STAGE 03</span>
            <h3 className="font-black font-sans text-[#1F2937] text-base uppercase">ADVERSARIAL CONFLICT</h3>
            <p className="text-[#1F2937]/70 text-xs leading-relaxed">
              Agents post findings into a shared Band.ai room. They challenge peer views dynamically to negotiate
              consensus parameters.
            </p>
          </div>

          <div className="space-y-4 p-6">
            <span className="font-bold font-mono text-[#1F2937] text-[10px]">STAGE 04</span>
            <h3 className="font-black font-sans text-[#1F2937] text-base uppercase">HARDENED LEDGER LOG</h3>
            <p className="text-[#1F2937]/70 text-xs leading-relaxed">
              The conversation transcript is compiled. The final verdict is logged to PostgreSQL, creating a
              tamper-proof audit record.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 pt-24 text-center">
        <div className="relative overflow-hidden rounded-lg border border-[#C7C7C7] bg-[#1F2937] p-12 text-[#FAF8F5] shadow-2xl">
          <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#76E1A7]/5 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="font-black font-sans text-3xl uppercase tracking-tight lg:text-4xl">
              Ready to verify model actions?
            </h2>
            <p className="mx-auto max-w-md text-[#FAF8F5]/70 text-xs leading-relaxed">
              Initialize your local operator node. Connect to the FastAPI backend, run pre-release governance checks,
              and secure your deployment pipeline.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="flex h-11 cursor-pointer items-center justify-center rounded-[22px] bg-[#76E1A7] px-8 font-black text-[#1F2937] text-xs uppercase tracking-wider transition-all hover:bg-[#8BF5BD] hover:shadow-[0_0_15px_rgba(118,225,167,0.5)]"
              >
                CREATE ACCOUNT
              </Link>
              <Link
                href="/login"
                className="flex h-11 cursor-pointer items-center justify-center rounded-[22px] border border-[#FAF8F5]/30 px-8 font-mono text-[#FAF8F5] text-xs uppercase tracking-wider transition-all hover:border-[#FAF8F5] hover:bg-[#FAF8F5]/10"
              >
                SIGN IN NODE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partners alignment & branding footer */}
      <footer className="relative z-10 mx-auto mt-12 max-w-7xl border-[#C7C7C7]/40 border-t px-8 pt-20">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo Clear Space banner */}
          <div className="flex items-center gap-4 rounded border border-[#C7C7C7]/30 bg-[#FAF8F5]/50 px-4 py-2 font-mono text-[#1F2937]/60 text-[10px] tracking-widest">
            <span>(O) BAND</span>
            <span className="text-[#C7C7C7]">×</span>
            <span>THE AI CHARTER</span>
            <span className="text-[#C7C7C7]">×</span>
            <span>POSTGRESQL 15</span>
          </div>

          <span className="font-mono text-[#1F2937]/40 text-[9px]">
            © 2026 THE AI CHARTER. ALL INTELLECTUAL LEDGERS SECURED.
          </span>
        </div>
      </footer>
    </div>
  )
}
