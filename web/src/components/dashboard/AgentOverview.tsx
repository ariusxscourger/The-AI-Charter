"use client"

import { Card } from "@/components/ui/Card"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Activity, Terminal, Database, ArrowDown, Send, CheckCircle2, MessageSquare } from "lucide-react"

export const AGENT_CONFIG = [
  {
    id: "AGENT 01",
    name: "Ethics Agent",
    emoji: "⚖️",
    provider: "Featherless.ai",
    focus: "Bias & Fair Alignment",
    detail: "Monitors token biases, toxicity parameters, and socio-ethical impact vectors.",
    scriptName: "ethics_agent.py",
    statusTexts: [
      "[Band.ai] Joined session room...",
      "[Local] Running fairness & bias domain evaluations...",
      "[Band.ai] Posted findings to room...",
      "[Band.ai] Evaluating peer cross-examination...",
      "[Local] Applying deterministic vote rules...",
      "[Band.ai] Broadcasted vote to room...",
    ],
  },
  {
    id: "AGENT 02",
    name: "Security Agent",
    emoji: "🔒",
    provider: "Featherless.ai",
    focus: "Threat & Sandbox Isolation",
    detail: "Audits vulnerability surfaces, sandboxed runs, PII leaks, and data sanitization.",
    scriptName: "security_agent.py",
    statusTexts: [
      "[Band.ai] Joined session room...",
      "[Local] Running vulnerability & sandbox domain evaluations...",
      "[Band.ai] Posted findings to room...",
      "[Band.ai] Evaluating peer cross-examination...",
      "[Local] Applying deterministic vote rules...",
      "[Band.ai] Broadcasted vote to room...",
    ],
  },
  {
    id: "AGENT 03",
    name: "Legal Agent",
    emoji: "📜",
    provider: "Featherless.ai",
    focus: "IP & Compliance Liability",
    detail: "Validates copyright exposure, license parameters, and software constraints.",
    scriptName: "legal_agent.py",
    statusTexts: [
      "[Band.ai] Joined session room...",
      "[Local] Running IP exposure domain evaluations...",
      "[Band.ai] Posted findings to room...",
      "[Band.ai] Evaluating peer cross-examination...",
      "[Local] Applying deterministic vote rules...",
      "[Band.ai] Broadcasted vote to room...",
    ],
  },
  {
    id: "AGENT 04",
    name: "Product Agent",
    emoji: "🚀",
    provider: "AI/ML API",
    focus: "Product & Metric Alignment",
    detail: "Analyzes system overhead, latency constraints, and product feedback loops.",
    scriptName: "product_agent.py",
    statusTexts: [
      "[Band.ai] Joined session room...",
      "[Local] Running latency & UX domain evaluations...",
      "[Band.ai] Posted findings to room...",
      "[Band.ai] Evaluating peer cross-examination...",
      "[Local] Applying deterministic vote rules...",
      "[Band.ai] Broadcasted vote to room...",
    ],
  },
  {
    id: "AGENT 05",
    name: "Compliance Agent",
    emoji: "✅",
    provider: "AI/ML API",
    focus: "Policy & Regulation (SOC2)",
    detail: "Enforces GDPR safeguards, audit capabilities, telemetry compliance, and data policies.",
    scriptName: "compliance_agent.py",
    statusTexts: [
      "[Band.ai] Joined session room...",
      "[Local] Running GDPR & SOC2 domain evaluations...",
      "[Band.ai] Posted findings to room...",
      "[Band.ai] Evaluating peer cross-examination...",
      "[Local] Applying deterministic vote rules...",
      "[Band.ai] Broadcasted vote to room...",
    ],
  },
]

export function AgentOverview() {
  const [activeAgents, setActiveAgents] = useState<string[]>([])
  const [logIndices, setLogIndices] = useState<Record<string, number>>({})
  const [pipelineState, setPipelineState] = useState(0)

  useEffect(() => {
    // Pipeline overall state (flashes lines at the top/bottom)
    const pipelineInterval = setInterval(() => {
      setPipelineState(prev => (prev + 1) % 4)
    }, 1500)

    // Randomly activate 1-3 agents every 2 seconds to simulate high network traffic
    const interval = setInterval(() => {
      const shuffled = [...AGENT_CONFIG].sort(() => 0.5 - Math.random())
      const selectedCount = Math.floor(Math.random() * 3) + 1
      const selected = shuffled.slice(0, selectedCount).map((a) => a.id)
      setActiveAgents(selected)

      // Update logs for active agents to simulate progression
      setLogIndices((prev) => {
        const next = { ...prev }
        selected.forEach((id) => {
          next[id] = ((next[id] || 0) + 1) % 6 // loop through the 6 status texts
        })
        return next
      })
    }, 2200)

    return () => {
      clearInterval(interval)
      clearInterval(pipelineInterval)
    }
  }, [])

  return (
    <div className="space-y-8 rounded-xl border border-[#C7C7C7] bg-[#1F2937] p-8 shadow-2xl relative overflow-hidden">
      {/* Background Grid Pattern for Command Center feel */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />

      {/* Glow orb behind header */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[#76E1A7]/5 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-[#A1DFF5]/5 blur-[80px]" />

      <div className="relative z-10 text-center flex flex-col items-center gap-1 border-b border-[#374151] pb-6">
        <h3 className="flex items-center gap-2 font-black font-sans text-2xl text-[#FAF8F5] uppercase tracking-tight">
          <Activity className="h-6 w-6 text-[#76E1A7]" />
          THE AI CHARTER PIPELINE
        </h3>
        <p className="font-mono text-[#FAF8F5]/60 text-[10px] uppercase tracking-wider">
          End-to-End Multi-Agent Governance Architecture
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        
        {/* =========================================
            NODE A: USER SUBMISSION 
        ========================================= */}
        <div className="flex flex-col items-center w-full max-w-sm mb-2">
          <div className="border border-[#38B0E8]/40 bg-[#111827] rounded-lg p-4 w-full shadow-[0_0_20px_rgba(56,176,232,0.1)] flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#38B0E8]/20 text-[#38B0E8]">
                <Send className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h4 className="font-bold font-sans text-sm text-[#FAF8F5] tracking-tight">User Submission</h4>
                <p className="font-mono text-[9px] text-[#38B0E8] uppercase">Next.js Web Client • POST /submit</p>
              </div>
            </div>
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }} 
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-[#38B0E8] shadow-[0_0_8px_#38B0E8]" 
            />
          </div>
          {/* Connector Down */}
          <motion.div 
            animate={{ opacity: pipelineState === 0 || pipelineState === 1 ? 1 : 0.3 }}
            className="h-8 w-[2px] bg-gradient-to-b from-[#38B0E8] to-[#76E1A7]" 
          />
        </div>

        {/* =========================================
            NODE B: BAND.AI SHARED CONTEXT HUB 
        ========================================= */}
        <div className="relative border border-[#76E1A7]/50 bg-[#111827] rounded-xl p-5 w-full shadow-[0_0_25px_rgba(118,225,167,0.1)] flex flex-col items-center text-center z-20 mb-2">
          <div className="absolute inset-0 bg-[#76E1A7]/5 rounded-xl animate-pulse" />
          <div className="relative z-10 flex items-center gap-3 mb-2">
            <MessageSquare className="h-5 w-5 text-[#76E1A7]" />
            <h4 className="font-black font-sans text-lg text-[#FAF8F5] uppercase tracking-tight">
              Band.ai Shared Context Room
            </h4>
          </div>
          <p className="relative z-10 font-mono text-[10px] text-[#FAF8F5]/60 mb-3 max-w-lg">
            FastAPI Orchestrator injects submission payload. All 5 agents connect to this room to evaluate, challenge peers, and establish consensus.
          </p>
          <div className="relative z-10 inline-flex items-center gap-2 rounded bg-[#0A0F18] border border-[#374151] px-3 py-1 font-mono text-[9px] text-[#76E1A7]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#76E1A7] animate-ping" />
            session_id: char-sys-review-active
          </div>
        </div>

        {/* =========================================
            NODE C: THE AGENT GRID
        ========================================= */}
        {/* Horizontal connector bar under the Band room to distribute to agents */}
        <div className="w-[80%] h-px bg-gradient-to-r from-transparent via-[#76E1A7]/40 to-transparent mb-2" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full z-10 relative">
          {AGENT_CONFIG.map((agent, i) => {
            const isActive = activeAgents.includes(agent.id)
            const currentLogIndex = logIndices[agent.id] || 0

            return (
              <div key={agent.id} className="flex flex-col items-center h-full">
                {/* Antenna down from Band Hub to Agent */}
                <motion.div 
                  animate={{ 
                    opacity: isActive ? 1 : 0.2,
                    height: isActive ? "24px" : "16px" 
                  }}
                  className={`w-[2px] mb-1 transition-all ${isActive ? "bg-gradient-to-b from-[#76E1A7] to-[#A1DFF5] shadow-[0_0_8px_#A1DFF5]" : "bg-[#374151]"}`} 
                />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="w-full h-full flex-1"
                >
                  <Card
                    className={`relative flex flex-col overflow-hidden transition-all duration-500 rounded-lg h-full ${
                      isActive
                        ? "border-[#76E1A7]/40 bg-[#1F2937] shadow-[0_0_20px_rgba(118,225,167,0.15)] transform scale-[1.02] z-20"
                        : "border-[#374151] bg-[#111827] z-10"
                    }`}
                  >
                    {/* Visual Trailing (Agent Tendrils) */}
                    {isActive && (
                      <div className="pointer-events-none absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#76E1A7] via-[#A1DFF5] to-[#76E1A7] shadow-[0_0_12px_rgba(118,225,167,0.8)]" />
                    )}

                    {/* Agent Header */}
                    <div className="flex items-center justify-between border-b border-[#374151]/50 bg-[#0A0F18]/50 px-3 py-2">
                      <span
                        className={`flex items-center gap-2 font-bold font-mono text-[10px] transition-colors ${isActive ? "text-[#FAF8F5]" : "text-[#FAF8F5]/60"}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${isActive ? "bg-[#A1DFF5] animate-pulse shadow-[0_0_8px_#A1DFF5]" : "bg-[#374151]"}`}
                        />
                        {agent.id}
                      </span>
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                          isActive
                            ? "border-[#A1DFF5]/30 text-[#A1DFF5] bg-[#A1DFF5]/10"
                            : "border-[#374151] text-[#FAF8F5]/40"
                        }`}
                      >
                        {agent.provider}
                      </span>
                    </div>

                    {/* Agent Info */}
                    <div className="flex gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A0F18] border border-[#374151] text-xl shadow-inner">
                        {agent.emoji}
                      </div>
                      <div className="space-y-1">
                        <h4
                          className={`font-bold font-sans text-sm tracking-tight leading-none transition-colors ${isActive ? "text-[#FAF8F5]" : "text-[#FAF8F5]/80"}`}
                        >
                          {agent.name}
                        </h4>
                        <span className="block font-mono text-[#38B0E8] text-[9px] uppercase leading-none">
                          {agent.focus}
                        </span>
                      </div>
                    </div>

                    {/* Brand Identity: Code Block Container (Terminal) */}
                    <div
                      className={`mt-auto border-t border-[#374151]/50 bg-[#1F2937] transition-colors ${isActive ? "bg-[#171E29]" : "bg-[#111827]"}`}
                    >
                      {/* Terminal Chrome Bar */}
                      <div className="flex items-center justify-between border-b border-[#374151]/30 bg-[#0A0F18] px-3 py-1.5">
                        <div className="flex gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-red-500/80" />
                          <span className="inline-block h-2 w-2 rounded-full bg-yellow-500/80" />
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500/80" />
                        </div>
                        <span className="font-mono text-[#FAF8F5]/40 text-[9px] tracking-widest">{agent.scriptName}</span>
                        <Terminal className="h-2.5 w-2.5 text-[#FAF8F5]/20" />
                      </div>

                      {/* Terminal Output Area */}
                      <div className="p-3 h-14 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${agent.id}-${isActive ? currentLogIndex : "idle"}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className={`font-mono text-[9px] leading-relaxed ${isActive ? "text-[#76E1A7]" : "text-[#FAF8F5]/30"}`}
                          >
                            {isActive ? (
                              <span className="flex items-start gap-1.5">
                                <span className="text-[#A1DFF5] opacity-80 mt-[2px] text-[8px]">❯</span> 
                                {agent.statusTexts[currentLogIndex]}
                              </span>
                            ) : (
                              <span className="flex items-start gap-1.5">
                                <span className="text-[#374151] mt-[2px] text-[8px]">❯</span> 
                                Awaiting room activity...
                              </span>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Antenna down from Agent to Ledger */}
                <motion.div 
                  animate={{ 
                    opacity: isActive ? 1 : 0.2,
                    height: isActive ? "24px" : "16px" 
                  }}
                  className={`w-[2px] mt-1 transition-all ${isActive ? "bg-gradient-to-t from-[#A1DFF5] to-[#76E1A7] shadow-[0_0_8px_#A1DFF5]" : "bg-[#374151]"}`} 
                />
              </div>
            )
          })}
        </div>

        {/* Horizontal connector bar under the agents to gather outputs */}
        <div className="w-[80%] h-px bg-gradient-to-r from-transparent via-[#A1DFF5]/40 to-transparent mt-2 mb-2" />

        {/* =========================================
            NODE D: GOVERNANCE RECORD OUTPUT 
        ========================================= */}
        <div className="flex flex-col items-center w-full max-w-sm mt-2">
          {/* Connector Down */}
          <motion.div 
            animate={{ opacity: pipelineState === 2 || pipelineState === 3 ? 1 : 0.3 }}
            className="h-8 w-[2px] bg-gradient-to-b from-[#A1DFF5] to-[#38B0E8]" 
          />
          <div className="border border-[#A1DFF5]/40 bg-[#111827] rounded-lg p-4 w-full shadow-[0_0_20px_rgba(161,223,245,0.1)] flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#A1DFF5]/20 text-[#A1DFF5]">
                <Database className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h4 className="font-bold font-sans text-sm text-[#FAF8F5] tracking-tight">Record Generator</h4>
                <p className="font-mono text-[9px] text-[#A1DFF5] uppercase">PostgreSQL • Frontend Rendering</p>
              </div>
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#A1DFF5]/20 text-[#A1DFF5]" 
            >
              <CheckCircle2 className="h-3 w-3" />
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  )
}
