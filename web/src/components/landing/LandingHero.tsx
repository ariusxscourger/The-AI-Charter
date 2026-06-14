"use client"

import { Cpu, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const STEPS = [
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

export function LandingHero() {
  const [terminalStep, setTerminalStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTerminalStep((prev) => (prev + 1) % STEPS.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  return (
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
            {STEPS.slice(0, terminalStep + 1).map((s) => (
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
  )
}
