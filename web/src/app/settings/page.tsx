import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1F2937]/10 text-[#1F2937]">
        <Settings className="h-8 w-8" />
      </div>
      <h1 className="font-black font-sans text-2xl text-[#1F2937] uppercase tracking-tight">Settings</h1>
      <p className="font-mono text-[#1F2937]/50 text-xs uppercase">Coming Soon</p>
    </div>
  )
}
