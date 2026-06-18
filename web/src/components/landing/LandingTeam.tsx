import { Github, Globe, Linkedin } from "lucide-react"
import Link from "next/link"

const TEAM_MEMBERS = [
  {
    name: "Muhammad Saqib",
    handle: "Arius_Scourger",
    role: "Team Lead & Core Operator",
    image:
      "https://storage.googleapis.com/lablab-static-eu/images/users/true/cmpucg4fw01jcs6012q1t3gvu_picture_qnq3keyh7tvw02ef2b1uxoiq.jpg",
    links: {
      github: "https://github.com/ariusxscourger",
      linkedin: "",
      portfolio: "",
    },
  },
  {
    name: "Muhammad Talal Jamil",
    handle: "muhammad_talal_jamil666",
    role: "Senior Full Stack Engineer",
    image:
      "https://storage.googleapis.com/lablab-static-eu/images/users/true/clyh0ny1l00y4gkguplcsup9l_picture_mbg8xvcseuzt5mvvcm3z4r2j.jpg",
    links: {
      github: "https://github.com/itxtalal",
      linkedin: "https://www.linkedin.com/in/itxtalal/",
      portfolio: "https://mtalaljamil.me",
    },
  },
  {
    name: "Muhammad Talha",
    handle: "MTalhaR",
    role: "AI Engineer",
    image: "https://storage.googleapis.com/lablab-static-eu/images/midjourney/profile/profile%20(28).png",
    links: {
      github: "https://github.com/muhammad-talha-ad",
      linkedin: "",
      portfolio: "",
    },
  },
  {
    name: "Muhammad Athar",
    handle: "atharrizwan",
    role: "Core Operator",
    image: "https://avatars.githubusercontent.com/u/113369629?v=4",
    links: {
      github: "https://github.com/atharrizwan",
      linkedin: "",
      portfolio: "",
    },
  },
  {
    name: "Meekal Jamil",
    handle: "meekal_jamil",
    role: "Full Stack Developer",
    image:
      "https://storage.googleapis.com/lablab-static-eu/images/users/true/cmq16bche00pxs6013jv2q6gh_picture_a3tvif6glll019xywjgxcyt1.jpg",
    links: {
      github: "https://github.com/Meekal-Jamil",
      linkedin: "https://www.linkedin.com/in/meekal-jamil",
      portfolio: "https://github.com/Meekal-Jamil",
    },
  },
  {
    name: "Muhammad Saad",
    handle: "itxsaaad",
    role: "Full Stack Software Engineer",
    image:
      "https://storage.googleapis.com/lablab-static-eu/images/users/true/cmpv2m43d000ks601kmwwztxx_picture_cszfd3024xa09tvd86shpfkf.jpg",
    links: {
      github: "https://github.com/itxsaaad",
      linkedin: "https://www.linkedin.com/in/itxsaaad",
      portfolio: "https://codesbysaad.dev",
    },
  },
]

export function LandingTeam() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-8 pt-24 pb-12">
      <div className="mb-12 text-center">
        <h2 className="font-black font-sans text-3xl text-[#1F2937] uppercase tracking-tight lg:text-4xl">
          TEAM BROKERBOTICS
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[#1F2937]/70 text-sm leading-relaxed">
          Team BrokerBotics blends sharp human strategy with elite AI agents to engineer the next generation of
          tactical, collaborative intelligent systems.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.handle}
            className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-[#C7C7C7]/50 bg-[#FAF8F5] p-6 shadow-sm transition-all hover:border-[#1F2937]/20 hover:shadow-md"
          >
            {/* Terminal styling decorative element */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#76E1A7] to-[#A1DFF5] opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-center gap-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#1F2937]/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="font-bold font-sans text-[#1F2937] text-lg leading-tight tracking-tight">
                  {member.name}
                </span>
                <span className="font-mono text-[#1F2937]/60 text-xs">@{member.handle}</span>
                <span className="inline-block pt-1 font-bold font-mono text-[#76E1A7] text-[9px] uppercase tracking-widest">
                  {member.role}
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-[#C7C7C7]/30 border-t pt-4">
              {member.links.portfolio && (
                <Link
                  href={member.links.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-[#76E1A7]/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#12B364] transition-colors hover:bg-[#76E1A7]/40"
                >
                  <Globe className="h-3 w-3" />
                  Website
                </Link>
              )}
              {member.links.linkedin && (
                <Link
                  href={member.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-[#0A66C2]/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0A66C2] transition-colors hover:bg-[#0A66C2]/20"
                >
                  <Linkedin className="h-3 w-3" />
                  LinkedIn
                </Link>
              )}
              {member.links.github && (
                <Link
                  href={member.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-[#1F2937]/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1F2937] transition-colors hover:bg-[#1F2937]/20"
                >
                  <Github className="h-3 w-3" />
                  GitHub
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
