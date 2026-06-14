"use client"

import { Card } from "@/components/ui/Card"
import { motion } from "framer-motion"

export const AGENT_CONFIG = [
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

export function AgentOverview() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">The Agent Panel</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AGENT_CONFIG.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card className="flex gap-4 border border-[#C7C7C7]/50 p-5 hover:border-[#1F2937] transition-all">
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
          </motion.div>
        ))}
      </div>
    </div>
  )
}
