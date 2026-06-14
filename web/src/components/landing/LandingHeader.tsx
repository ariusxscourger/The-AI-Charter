import { Database } from "lucide-react"
import Link from "next/link"

export function LandingHeader() {
  return (
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
  )
}
