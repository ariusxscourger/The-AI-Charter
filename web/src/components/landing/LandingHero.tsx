"use client"

import { useAuth } from "@/context/AuthContext"
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileText,
  Gavel,
  Rocket,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState, type ComponentType } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

type TerminalTone = "muted" | "ok" | "warn" | "blue" | "final"

const STEPS: {
  icon: ComponentType<{ className?: string }>
  label: string
  text: string
  tone: TerminalTone
}[] = [
  {
    icon: Cpu,
    label: "SYSTEM",
    text: "Initializing evaluation for 'LLM Auto-Reconciliation Engine'...",
    tone: "muted",
  },
  {
    icon: Scale,
    label: "ETHICS",
    text: "Analyzing fairness constraints. No major bias issues found. [VOTE: APPROVED]",
    tone: "ok",
  },
  {
    icon: ShieldAlert,
    label: "SECURITY",
    text: "Direct database queries detected in data pipeline. SQL injection risk. [VOTE: REJECTED]",
    tone: "warn",
  },
  {
    icon: FileText,
    label: "LEGAL",
    text: "Scanning copyright exposure. IP risk remains within threshold. [VOTE: APPROVED]",
    tone: "ok",
  },
  {
    icon: CheckCircle2,
    label: "COMPLIANCE",
    text: "Verifying SOC2 and GDPR telemetry storage. Approved. [VOTE: APPROVED]",
    tone: "ok",
  },
  {
    icon: Rocket,
    label: "PRODUCT",
    text: "Metric parameters checked. UX limits are satisfactory. [VOTE: APPROVED]",
    tone: "ok",
  },
  {
    icon: ShieldCheck,
    label: "SECURITY",
    text: "Challenge: conditional approval if runtime stays isolated in a sandbox. [VOTE: CONDITIONAL]",
    tone: "blue",
  },
  {
    icon: Rocket,
    label: "PRODUCT",
    text: "Response: sandbox runtime accepted. UX performance risk resolved. [VOTE: APPROVED]",
    tone: "muted",
  },
  {
    icon: CheckCircle2,
    label: "SYSTEM",
    text: "Consensus reached. Verdict: CONDITIONAL_APPROVAL. Governance record generated.",
    tone: "final",
  },
]

const TONE_CLASS: Record<TerminalTone, string> = {
  muted: "text-[#FAF8F5]/55",
  ok: "text-[#76E1A7]/95",
  warn: "text-red-300 font-bold",
  blue: "text-[#A1DFF5]",
  final: "text-[#76E1A7] font-black underline decoration-[#76E1A7]/60 decoration-2 underline-offset-4",
}

export function LandingHero() {
  const [terminalStep, setTerminalStep] = useState(0)
  const terminalStepRef = useRef(0)
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return

    let timeout: ReturnType<typeof setTimeout>

    const advance = () => {
      const next = terminalStepRef.current >= STEPS.length - 1 ? 0 : terminalStepRef.current + 1
      terminalStepRef.current = next
      setTerminalStep(next)
      timeout = setTimeout(advance, next === 0 ? 900 : 1650)
    }

    timeout = setTimeout(advance, 700)
    return () => clearTimeout(timeout)
  }, [reduceMotion])

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-8 pt-10 lg:grid-cols-12 lg:pt-12"
    >
      <div className="space-y-6 pt-4 lg:col-span-5">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded border border-[#C7C7C7] bg-[#1F2937] px-3 py-1 font-bold font-mono text-[#76E1A7] text-[9px] uppercase tracking-wider"
        >
          <Cpu className="h-3.5 w-3.5" />
          Track 3: Regulated and High-Stakes Workflows
        </motion.div>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="font-black font-sans text-4xl text-[#1F2937] uppercase leading-[0.98] tracking-tight lg:text-5xl"
        >
          Collaborative Multi-Agent Governance
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="max-w-md text-[#1F2937]/75 text-sm leading-relaxed"
        >
          The AI Charter reviews proposed AI features before release. Five specialized agents debate ethics, security,
          compliance, legal liability, and product constraints to create a transparent audit ledger.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.34 }}
          className="flex flex-wrap gap-4 pt-2"
        >
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-[22px] border border-[#1F2937]/10 bg-[#76E1A7] px-6 font-black text-[#1F2937] text-xs uppercase tracking-wider transition-all hover:bg-[#8BF5BD] active:scale-[0.98]"
          >
            {user ? "ENTER OPERATOR HUB" : "INITIALIZE NODE"}
            <ArrowRight className="h-4 w-4 stroke-[3px]" />
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:col-span-7"
      >
        <div className="overflow-hidden rounded-lg border border-[#C7C7C7] bg-[#1F2937] text-[#FAF8F5] shadow-2xl">
          <div className="flex items-center justify-between border-[#C7C7C7]/20 border-b bg-[#171E29] px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-[#FAF8F5]/45 text-[10px] uppercase tracking-wider">
                Live governance transcript
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[#FAF8F5]/40 text-[10px] tracking-wider">
              <span className="inline-block h-3 w-3 rounded-full bg-[#76E1A7] shadow-[0_0_10px_rgba(118,225,167,0.7)]" />
              session-simulation-active
            </div>
          </div>

          <div className="max-h-[430px] min-h-[390px] space-y-3 overflow-hidden p-6 font-mono text-xs lg:min-h-[450px]">
            <AnimatePresence initial={false}>
              {STEPS.slice(0, terminalStep + 1).map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={`${step.label}-${step.text}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className={`${TONE_CLASS[step.tone]} animate-fade-in border-[#C7C7C7]/10 border-l-2 pl-3 leading-relaxed`}
                  >
                    <div className="flex gap-2">
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
                      <span>
                        <span className="font-bold">{step.label}</span> [{String(index + 1).padStart(2, "0")}] {step.text}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {!reduceMotion && (
              <motion.div
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="pt-1 text-[#FAF8F5]/30 text-[10px]"
              >
                ❯ [Awaiting next agent token broadcast...]
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between border-[#C7C7C7]/10 border-t bg-[#171E29] px-4 py-2">
            <span className="font-mono text-[#FAF8F5]/40 text-[9px] uppercase tracking-wider">
              {terminalStep + 1}/{STEPS.length} transcript lines
            </span>
            <span className="h-1.5 w-28 overflow-hidden rounded-full bg-[#C7C7C7]/10">
              <motion.span
                className="block h-full bg-[#76E1A7]"
                animate={{ width: reduceMotion ? "100%" : `${((terminalStep + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}
