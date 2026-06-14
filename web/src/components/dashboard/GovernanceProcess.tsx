import { ArrowRight } from "lucide-react"

export function GovernanceProcess() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold font-mono text-[#1F2937] text-xs uppercase tracking-wider">
        Governance Process Lifecycle
      </h3>

      <div className="grid grid-cols-1 gap-4 font-mono text-[10px] sm:grid-cols-4">
        <div className="relative rounded border border-[#C7C7C7]/60 bg-[#FAF8F5] p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-1 font-bold text-[#38B0E8]">01. SUBMISSION</div>
          <p className="text-[#1F2937]/60 text-[9px] leading-normal">
            Submit features specs, data sources, and risk profiles.
          </p>
          <ArrowRight className="absolute right-2 bottom-2 hidden h-3 w-3 text-[#C7C7C7] sm:block" />
        </div>
        <div className="relative rounded border border-[#C7C7C7]/60 bg-[#FAF8F5] p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-1 font-bold text-[#76E1A7]">02. EVALUATION</div>
          <p className="text-[#1F2937]/60 text-[9px] leading-normal">
            5 specialized agents independently write findings in parallel.
          </p>
          <ArrowRight className="absolute right-2 bottom-2 hidden h-3 w-3 text-[#C7C7C7] sm:block" />
        </div>
        <div className="relative rounded border border-[#C7C7C7]/60 bg-[#FAF8F5] p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-1 font-bold text-[#A1DFF5]">03. ADVERSARIAL</div>
          <p className="text-[#1F2937]/60 text-[9px] leading-normal">
            Agents challenge peer conclusions inside the Band room.
          </p>
          <ArrowRight className="absolute right-2 bottom-2 hidden h-3 w-3 text-[#C7C7C7] sm:block" />
        </div>
        <div className="rounded border border-[#C7C7C7]/60 bg-[#FAF8F5] p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-1 font-bold text-[#1F2937]">04. IMMUTABLE RECORD</div>
          <p className="text-[#1F2937]/60 text-[9px] leading-normal">
            Record compiled from room transcript and saved to Postgres.
          </p>
        </div>
      </div>
    </div>
  )
}
