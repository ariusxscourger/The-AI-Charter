"use client"

import { AGENT_CONFIG } from "@/components/dashboard/AgentOverview"
import { Card } from "@/components/ui/Card"
import { getGovernanceRecord, getSessionStatus, saveRecord } from "@/lib/api"
import { usePolling } from "@/lib/poll"
import type { SessionStatus } from "@/types/charter"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, ChevronLeft, Database, Loader2, MessageSquare, Send, Sparkles, Terminal } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export function SessionReviewClient() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollingDelay, setPollingDelay] = useState<number | null>(3000)
  const [compiling, setCompiling] = useState(false)
  const [pipelineState, setPipelineState] = useState(0)

  useEffect(() => {
    // Pipeline overall state (flashes lines at the top/bottom)
    const pipelineInterval = setInterval(() => {
      setPipelineState((prev) => (prev + 1) % 4)
    }, 1500)
    return () => clearInterval(pipelineInterval)
  }, [])

  const compileAndPersistRecord = useCallback(async () => {
    setCompiling(true)
    try {
      const record = await getGovernanceRecord(sessionId)
      await saveRecord(record)
      router.push(`/dashboard/record/${sessionId}`)
    } catch (err) {
      const error = err as Error
      console.error(error)
      setError(error.message || "Failed to persist compiled governance record")
      setCompiling(false)
    }
  }, [sessionId, router])

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getSessionStatus(sessionId)
      setStatus(data)

      if (data.status === "complete") {
        setPollingDelay(null)
        await compileAndPersistRecord()
      }
    } catch (err) {
      const error = err as Error
      console.error(error)
      setError(error.message || "Failed to poll session status")
    }
  }, [sessionId, compileAndPersistRecord])

  usePolling(fetchStatus, pollingDelay)

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const getVoteColor = (vote?: string) => {
    if (!vote) return "text-[#FAF8F5]/30 border-[#374151]"
    switch (vote.toLowerCase()) {
      case "approve":
        return "text-[#76E1A7] border-[#76E1A7]/30 bg-[#76E1A7]/10"
      case "reject":
        return "text-red-500 border-red-500/30 bg-red-500/10"
      case "flag":
        return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10"
      default:
        return "text-[#FAF8F5]/30 border-[#374151]"
    }
  }

  return (
    <div className="relative w-full">
      {/* Header with Cancel */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 font-bold font-mono text-[#38B0E8] text-xs uppercase hover:text-[#1F2937] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Return to Hub
        </button>
      </div>

      <main className="mx-auto w-full max-w-7xl">
        {error && (
          <div className="mb-6 rounded border border-red-500/20 bg-red-950/10 p-4 font-mono text-red-500 text-xs">
            ⚠️ {error}
          </div>
        )}

        <div className="mb-6 space-y-1.5">
          <span className="flex items-center gap-1.5 font-bold font-mono text-[#38B0E8] text-[10px] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Active Review Room open in Band.ai
          </span>
          <h2 className="font-black font-sans text-3xl text-[#1F2937] uppercase tracking-tight">
            {status ? status.featureName : "Loading Session..."}
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {/* Top Row: Agent Pipeline */}
          <div className="space-y-8 w-full">
            <div className="space-y-8 rounded-xl border border-[#C7C7C7] bg-[#1F2937] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
              {/* Background Grid Pattern */}
              <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />
              <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[#76E1A7]/5 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-[#A1DFF5]/5 blur-[80px]" />

              <div className="relative z-10 flex flex-col items-center w-full">
                {/* NODE A: USER SUBMISSION */}
                <div className="flex flex-col items-center w-full max-w-sm mb-2">
                  <div className="border border-[#38B0E8]/40 bg-[#111827] rounded-lg p-4 w-full shadow-[0_0_20px_rgba(56,176,232,0.1)] flex items-center justify-between z-20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#38B0E8]/20 text-[#38B0E8]">
                        <Send className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold font-sans text-sm text-[#FAF8F5] tracking-tight">
                          Proposal Submitted
                        </h4>
                        <p className="font-mono text-[9px] text-[#38B0E8] uppercase">Next.js Web Client</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-[#38B0E8] shadow-[0_0_8px_#38B0E8]"
                    />
                  </div>
                  <motion.div
                    animate={{ opacity: pipelineState === 0 || pipelineState === 1 ? 1 : 0.3 }}
                    className="h-8 w-[2px] bg-gradient-to-b from-[#38B0E8] to-[#76E1A7]"
                  />
                </div>

                {/* NODE B: BAND.AI HUB */}
                <div className="relative border border-[#76E1A7]/50 bg-[#111827] rounded-xl p-5 w-full shadow-[0_0_25px_rgba(118,225,167,0.1)] flex flex-col items-center text-center z-20 mb-2">
                  <div className="absolute inset-0 bg-[#76E1A7]/5 rounded-xl animate-pulse" />
                  <div className="relative z-10 flex items-center gap-3 mb-2">
                    <MessageSquare className="h-5 w-5 text-[#76E1A7]" />
                    <h4 className="font-black font-sans text-lg text-[#FAF8F5] uppercase tracking-tight">
                      Band.ai Shared Context Room
                    </h4>
                  </div>
                  <div className="relative z-10 inline-flex items-center gap-2 rounded bg-[#0A0F18] border border-[#374151] px-3 py-1 font-mono text-[9px] text-[#76E1A7]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#76E1A7] animate-ping" />
                    session_id: {sessionId.substring(0, 15)}...
                  </div>
                </div>

                {/* NODE C: AGENT GRID */}
                <div className="w-[80%] h-px bg-gradient-to-r from-transparent via-[#76E1A7]/40 to-transparent mb-2" />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full z-10 relative">
                  {status?.agents.map((agent, i) => {
                    const agentConfig = AGENT_CONFIG.find((a) => a.name === agent.name) || AGENT_CONFIG[0]
                    const isActive = agent.status === "reviewing"
                    const hasVoted = agent.status === "voted"

                    return (
                      <div key={agent.id} className="flex flex-col items-center h-full">
                        <motion.div
                          animate={{ opacity: isActive ? 1 : 0.2, height: isActive ? "24px" : "16px" }}
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
                                : hasVoted
                                  ? "border-[#A1DFF5]/30 bg-[#171E29] z-10"
                                  : "border-[#374151] bg-[#111827] z-10"
                            }`}
                          >
                            {isActive && (
                              <div className="pointer-events-none absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#76E1A7] via-[#A1DFF5] to-[#76E1A7] shadow-[0_0_12px_rgba(118,225,167,0.8)]" />
                            )}

                            <div className="flex items-center justify-between border-b border-[#374151]/50 bg-[#0A0F18]/50 px-3 py-2">
                              <span
                                className={`flex items-center gap-2 font-bold font-mono text-[10px] transition-colors ${isActive ? "text-[#FAF8F5]" : "text-[#FAF8F5]/60"}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${isActive ? "bg-[#A1DFF5] animate-pulse shadow-[0_0_8px_#A1DFF5]" : hasVoted ? "bg-[#76E1A7]" : "bg-[#374151]"}`}
                                />
                                {agentConfig.id}
                              </span>
                              <span
                                className={`font-mono text-[9px] px-1.5 py-0.5 rounded border transition-colors ${isActive ? "border-[#A1DFF5]/30 text-[#A1DFF5] bg-[#A1DFF5]/10" : "border-[#374151] text-[#FAF8F5]/40"}`}
                              >
                                {agentConfig.provider}
                              </span>
                            </div>

                            <div className="flex gap-3 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A0F18] border border-[#374151] text-xl shadow-inner">
                                {agent.emoji}
                              </div>
                              <div className="space-y-1 w-full">
                                <h4
                                  className={`font-bold font-sans text-sm tracking-tight leading-none transition-colors ${isActive ? "text-[#FAF8F5]" : "text-[#FAF8F5]/80"}`}
                                >
                                  {agent.name}
                                </h4>
                                <div className="flex items-center justify-between w-full">
                                  <span className="block font-mono text-[#38B0E8] text-[9px] uppercase leading-none">
                                    {agentConfig.focus}
                                  </span>
                                  {hasVoted && (
                                    <span
                                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${getVoteColor(agent.vote)}`}
                                    >
                                      {agent.vote}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`mt-auto border-t border-[#374151]/50 bg-[#1F2937] transition-colors ${isActive ? "bg-[#171E29]" : "bg-[#111827]"}`}
                            >
                              <div className="flex items-center justify-between border-b border-[#374151]/30 bg-[#0A0F18] px-3 py-1.5">
                                <div className="flex gap-1">
                                  <span className="inline-block h-2 w-2 rounded-full bg-red-500/80" />
                                  <span className="inline-block h-2 w-2 rounded-full bg-yellow-500/80" />
                                  <span className="inline-block h-2 w-2 rounded-full bg-green-500/80" />
                                </div>
                                <span className="font-mono text-[#FAF8F5]/40 text-[9px] tracking-widest">
                                  {agentConfig.scriptName}
                                </span>
                                <Terminal className="h-2.5 w-2.5 text-[#FAF8F5]/20" />
                              </div>

                              <div className="p-3 h-10 overflow-hidden relative">
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={agent.status}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                    className={`font-mono text-[9px] leading-relaxed ${isActive ? "text-[#76E1A7]" : "text-[#FAF8F5]/30"}`}
                                  >
                                    <span className="flex items-start gap-1.5 uppercase">
                                      <span
                                        className={
                                          isActive
                                            ? "text-[#A1DFF5] opacity-80 mt-[2px] text-[8px]"
                                            : "text-[#374151] mt-[2px] text-[8px]"
                                        }
                                      >
                                        ❯
                                      </span>
                                      {isActive
                                        ? "Running evaluation..."
                                        : hasVoted
                                          ? "Evaluation Complete"
                                          : "Awaiting..."}
                                    </span>
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                            </div>
                          </Card>
                        </motion.div>

                        <motion.div
                          animate={{ opacity: hasVoted ? 1 : 0.2, height: hasVoted ? "24px" : "16px" }}
                          className={`w-[2px] mt-1 transition-all ${hasVoted ? "bg-gradient-to-t from-[#A1DFF5] to-[#76E1A7] shadow-[0_0_8px_#A1DFF5]" : "bg-[#374151]"}`}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="w-[80%] h-px bg-gradient-to-r from-transparent via-[#A1DFF5]/40 to-transparent mt-2 mb-2" />

                {/* NODE D: OUTPUT */}
                <div className="flex flex-col items-center w-full max-w-sm mt-2">
                  <motion.div
                    animate={{ opacity: status?.status === "complete" ? 1 : 0.3 }}
                    className="h-8 w-[2px] bg-gradient-to-b from-[#A1DFF5] to-[#38B0E8]"
                  />
                  <div className="border border-[#A1DFF5]/40 bg-[#111827] rounded-lg p-4 w-full shadow-[0_0_20px_rgba(161,223,245,0.1)] flex items-center justify-between z-20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#A1DFF5]/20 text-[#A1DFF5]">
                        <Database className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold font-sans text-sm text-[#FAF8F5] tracking-tight">Record Generator</h4>
                        <p className="font-mono text-[9px] text-[#A1DFF5] uppercase">PostgreSQL • Audit Trail</p>
                      </div>
                    </div>
                    {compiling || status?.status === "complete" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#A1DFF5]" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-[#A1DFF5]/30" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Scrolling Terminal Feed */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
              <Terminal className="h-4 w-4" />
              Band.ai Live Transcript
            </h3>

            <Card
              terminalTitle="Governance Feed Console"
              className="flex h-[400px] flex-col border border-[#1F2937] bg-[#1F2937] text-white"
            >
              <div className="scrollbar-thin flex-1 select-text space-y-2.5 overflow-y-auto pr-2 font-mono text-[#76E1A7]/90 text-[11px] p-4">
                {status?.activityFeed.length === 0 ? (
                  <div className="py-12 text-center text-[#FAF8F5]/40 text-[10px] uppercase tracking-wider">
                    Establishing connection, listening for events...
                  </div>
                ) : (
                  status?.activityFeed.map((entry, idx) => (
                    <div key={`${entry.timestamp}-${idx}`} className="leading-normal border-b border-[#FAF8F5]/5 pb-2">
                      <span className="mr-1.5 select-none text-[#FAF8F5]/40">
                        [{new Date(entry.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className="mr-1.5 font-bold text-[#38B0E8] uppercase">{entry.agentId}:</span>
                      <span>{entry.message}</span>
                    </div>
                  ))
                )}

                {compiling && (
                  <div className="flex animate-pulse items-center gap-2 border-[#FAF8F5]/10 border-t pt-4 font-bold text-[#76E1A7] uppercase tracking-wider mt-4">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Compiling Governance Audit Trail...
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
