"use client"

import { AlertTriangle, CheckCircle, Database, HelpCircle, Loader2, Sparkles, Terminal } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui/Card"
import { getGovernanceRecord, getSessionStatus, saveRecord } from "@/lib/api"
import { usePolling } from "@/lib/poll"
import type { SessionStatus } from "@/types/charter"

export function SessionReviewClient() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollingDelay, setPollingDelay] = useState<number | null>(3000)
  const [compiling, setCompiling] = useState(false)

  const compileAndPersistRecord = useCallback(async () => {
    setCompiling(true)
    try {
      // 1. Fetch record compiled from Band transcript
      const record = await getGovernanceRecord(sessionId)

      // 2. Save it to PostgreSQL database
      await saveRecord(record)

      // 3. Navigate to record details
      router.push(`/record/${sessionId}`)
    } catch (err) {
      const error = err as Error
      console.error(error)
      setError(error.message || "Failed to persist compiled governance record")
      setCompiling(false)
    }
  }, [sessionId, router])

  // Fetch status callback
  const fetchStatus = useCallback(async () => {
    try {
      const data = await getSessionStatus(sessionId)
      setStatus(data)

      // Handle session completed state
      if (data.status === "complete") {
        setPollingDelay(null) // Stop polling
        await compileAndPersistRecord()
      }
    } catch (err) {
      const error = err as Error
      console.error(error)
      setError(error.message || "Failed to poll session status")
    }
  }, [sessionId, compileAndPersistRecord])

  // Poll status periodically
  usePolling(fetchStatus, pollingDelay)

  // Trigger initial fetch on load
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const getAgentStatusStyle = (agentStatus: string) => {
    switch (agentStatus) {
      case "voted":
        return "border-[#76E1A7] text-[#76E1A7] bg-[#76E1A7]/5"
      case "reviewing":
        return "border-[#38B0E8] text-[#38B0E8] bg-[#38B0E8]/5 animate-pulse"
      default:
        return "border-[#C7C7C7]/50 text-[#C7C7C7] bg-[#FAF8F5]"
    }
  }

  const getVoteIcon = (vote?: string) => {
    if (!vote) return <HelpCircle className="h-4 w-4" />
    switch (vote.toLowerCase()) {
      case "approve":
        return <CheckCircle className="h-4 w-4 text-[#76E1A7]" />
      case "reject":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "flag":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }

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
        <div className="font-mono text-[#1F2937]/50 text-xs uppercase">
          SESSION ID: <span className="font-bold text-[#1F2937]">{sessionId.substring(0, 15)}...</span>
        </div>
      </header>

      {/* Review Dashboard */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-12">
        {error && (
          <div className="mb-6 rounded border border-red-500/20 bg-red-950/10 p-4 font-mono text-red-500 text-xs">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Columns: Agent Status Board */}
          <div className="space-y-8 lg:col-span-2">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 font-bold font-mono text-[#38B0E8] text-[10px] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Active Review Room open in Band.ai
              </span>
              <h2 className="font-black font-sans text-2xl text-[#1F2937] uppercase tracking-tight">
                {status ? status.featureName : "Loading Session..."}
              </h2>
            </div>

            {/* Agent Consensus Dashboard */}
            <div className="space-y-4">
              <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
                Consensus Agent Room
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {status?.agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`flex flex-col items-center justify-between border p-5 text-center transition-all ${getAgentStatusStyle(agent.status)}`}
                  >
                    <span className="mb-2 text-3xl" role="img" aria-label={agent.name}>
                      {agent.emoji}
                    </span>
                    <h4 className="mb-1 font-bold font-mono text-[#1F2937] text-sm">{agent.name}</h4>

                    <span className="mb-4 rounded-md border border-current px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider opacity-80">
                      {agent.status}
                    </span>

                    <div className="mt-auto flex w-full items-center justify-center gap-1.5 border-[#C7C7C7]/20 border-t pt-2 font-mono font-semibold text-[#1F2937] text-xs">
                      {getVoteIcon(agent.vote)}
                      <span className="uppercase">{agent.vote || "Waiting..."}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Scrolling Terminal Feed */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
              <Terminal className="h-4 w-4" />
              Band.ai Live Transcript
            </h3>

            <Card terminalTitle="Governance Feed Console" className="flex h-[400px] flex-col">
              <div className="scrollbar-thin flex-1 select-text space-y-2.5 overflow-y-auto pr-2 font-mono text-[#76E1A7]/90 text-[11px]">
                {status?.activityFeed.length === 0 ? (
                  <div className="py-12 text-center text-[#FAF8F5]/40 text-[10px] uppercase tracking-wider">
                    Establishing connection, listening for events...
                  </div>
                ) : (
                  status?.activityFeed.map((entry, idx) => (
                    <div key={`${entry.timestamp}-${idx}`} className="leading-normal">
                      <span className="mr-1.5 select-none text-[#FAF8F5]/40">
                        [{new Date(entry.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className="mr-1.5 font-bold text-[#38B0E8] uppercase">{entry.agentId}:</span>
                      <span>{entry.message}</span>
                    </div>
                  ))
                )}

                {compiling && (
                  <div className="flex animate-pulse items-center gap-2 border-[#FAF8F5]/10 border-t pt-4 font-bold text-[#76E1A7] uppercase tracking-wider">
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
