"use client"

import { Check, Eye, EyeOff, Loader2, ShieldAlert, X } from "lucide-react"
import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function SignupPage() {
  const { register } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Password Rules validation state
  const [rules, setRules] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  })

  useEffect(() => {
    setRules({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[\W_]/.test(password),
    })
  }, [password])

  const isPasswordValid = Object.values(rules).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!isPasswordValid) {
      setFormError("Please satisfy all key complexity rules first.")
      return
    }

    setSubmitting(true)
    try {
      await register(email, password)
    } catch (err) {
      const error = err as Error
      setFormError(error.message || "Failed to register node. Please try a different email.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] p-4">
      {/* Background Retrotech Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#C7C7C7_1px,transparent_1px),linear-gradient(to_bottom,#C7C7C7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Decorative Grid Lines with Crosshairs */}
      <div className="pointer-events-none absolute top-8 right-8 bottom-8 left-8 z-0 border border-[#C7C7C7]/40">
        <span className="absolute -top-3.5 -left-1.5 select-none font-bold font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -top-3.5 -right-1.5 select-none font-bold font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -bottom-3.5 -left-1.5 select-none font-bold font-mono text-[#C7C7C7] text-sm">+</span>
        <span className="absolute -right-1.5 -bottom-3.5 select-none font-bold font-mono text-[#C7C7C7] text-sm">
          +
        </span>
      </div>

      {/* Signup Box */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[#C7C7C7] bg-[#FAF8F5] p-8 shadow-xl">
        {/* Header Branding */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1F2937] text-[#76E1A7] shadow-[0_0_15px_rgba(118,225,167,0.3)]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="font-extrabold font-sans text-2xl text-[#1F2937] uppercase tracking-tight">THE AI CHARTER</h1>
          <p className="mt-1 font-mono text-[#1F2937]/60 text-[10px] uppercase tracking-wider">
            Register Governance Node
          </p>
        </div>

        {formError && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-950/10 p-3 font-mono text-red-500 text-xs">
            ⚠️ {formError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded border border-[#C7C7C7] bg-[#FAF8F5] px-3 py-2 font-mono text-[#1F2937] text-sm outline-hidden transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
              placeholder="operator@system.org"
            />
          </div>

          <div className="relative flex flex-col">
            <label htmlFor="password" className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
              Security Key (Password)
            </label>

            {/* Rules list above input as per guides.md guidelines */}
            <div className="mb-3 space-y-1.5 rounded border border-[#C7C7C7] bg-[#FAF8F5] p-3 font-mono text-[10px]">
              <div className="mb-1 font-bold text-[#1F2937]/70 uppercase tracking-wider">Key Complexity Rules:</div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1">
                  {rules.minLength ? (
                    <Check className="h-3 w-3 text-[#76E1A7]" />
                  ) : (
                    <X className="h-3 w-3 text-[#C7C7C7]" />
                  )}
                  <span className={rules.minLength ? "text-[#76E1A7]" : "text-[#1F2937]/50"}>8+ chars</span>
                </div>
                <div className="flex items-center gap-1">
                  {rules.hasUppercase ? (
                    <Check className="h-3 w-3 text-[#76E1A7]" />
                  ) : (
                    <X className="h-3 w-3 text-[#C7C7C7]" />
                  )}
                  <span className={rules.hasUppercase ? "text-[#76E1A7]" : "text-[#1F2937]/50"}>1 Uppercase</span>
                </div>
                <div className="flex items-center gap-1">
                  {rules.hasNumber ? (
                    <Check className="h-3 w-3 text-[#76E1A7]" />
                  ) : (
                    <X className="h-3 w-3 text-[#C7C7C7]" />
                  )}
                  <span className={rules.hasNumber ? "text-[#76E1A7]" : "text-[#1F2937]/50"}>1 Number</span>
                </div>
                <div className="flex items-center gap-1">
                  {rules.hasSpecial ? (
                    <Check className="h-3 w-3 text-[#76E1A7]" />
                  ) : (
                    <X className="h-3 w-3 text-[#C7C7C7]" />
                  )}
                  <span className={rules.hasSpecial ? "text-[#76E1A7]" : "text-[#1F2937]/50"}>1 Special</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded border border-[#C7C7C7] bg-[#FAF8F5] py-2 pr-10 pl-3 font-mono text-[#1F2937] text-sm outline-hidden transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#1F2937]/50 transition-colors hover:text-[#1F2937]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isPasswordValid}
            className="mt-2 flex h-10 w-full cursor-pointer items-center justify-center rounded-[20px] bg-[#76E1A7] font-bold text-[#1F2937] text-sm uppercase tracking-wide transition-all hover:bg-[#8BF5BD] hover:shadow-[0_0_12px_rgba(118,225,167,0.4)] disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                COMMITTING...
              </>
            ) : (
              "REGISTER NODE"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="font-mono text-[#1F2937]/60 text-[11px]">
            Node already exists?{" "}
            <Link href="/login" className="font-bold text-[#38B0E8] hover:underline">
              Authenticate Key
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
