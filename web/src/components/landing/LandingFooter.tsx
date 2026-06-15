export function LandingFooter() {
  return (
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
  )
}
