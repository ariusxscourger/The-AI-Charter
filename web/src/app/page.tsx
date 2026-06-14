import { AgentOverview } from "@/components/dashboard/AgentOverview"
import { LandingCTA } from "@/components/landing/LandingCTA"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingHero } from "@/components/landing/LandingHero"
import { LandingPartners } from "@/components/landing/LandingPartners"

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAF8F5] pb-24 font-sans text-[#1F2937]">
      {/* Retrotech background grid */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-20" />

      {/* Decorative Border Frame with Crosshairs */}
      <div className="pointer-events-none absolute top-16 right-6 bottom-6 left-6 z-0 border border-[#C7C7C7]">
        <span className="absolute -top-3.5 -left-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -top-3.5 -right-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -bottom-3.5 -left-1.5 select-none font-black font-mono text-[#C7C7C7] text-sm">
          +
        </span>
        <span className="absolute -right-1.5 -bottom-3.5 select-none font-black font-mono text-[#C7C7C7] text-sm">
          +
        </span>
      </div>

      <LandingHeader />

      <LandingHero />

      {/* Grid of the 5 Specialized Agents */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 pt-20">
        <AgentOverview />
      </section>

      <LandingPartners />

      <LandingCTA />

      <LandingFooter />
    </div>
  )
}
