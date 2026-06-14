import Link from "next/link"

export function LandingCTA() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-8 pt-16 text-center">
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
  )
}
