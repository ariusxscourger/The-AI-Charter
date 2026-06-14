"use client"

import { Card } from "@/components/ui/Card"
import { ProgressSteps } from "@/components/ui/ProgressSteps"
import { submitProposal } from "@/lib/api"
import { ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

export function SubmitProposalClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Overview
  const [featureName, setFeatureName] = useState("")
  const [description, setDescription] = useState("")
  const [intendedUse, setIntendedUse] = useState("")
  const [featureType, setFeatureType] = useState<
    "new_feature" | "model_change" | "prompt_change" | "integration" | "other"
  >("new_feature")

  // Step 2: Risk Profile
  const [affectedSystemsInput, setAffectedSystemsInput] = useState("")
  const [dataSources, setDataSources] = useState("")
  const [piiInvolved, setPiiInvolved] = useState<"yes" | "no" | "unknown">("unknown")
  const [thirdPartyDeps, setThirdPartyDeps] = useState("")
  const [existingRiskAssessment, setExistingRiskAssessment] = useState("")

  // Step 3: Jurisdiction & Compliance
  const [jurisdictions, setJurisdictions] = useState<string[]>(["US"])
  const [complianceTargets, setComplianceTargets] = useState<string[]>([])

  const steps = ["Overview", "Risk Profile", "Compliance"]

  const handleNext = () => {
    if (step === 1 && !featureName.trim()) return
    setStep((prev) => Math.min(prev + 1, 3))
  }

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleJurisdictionChange = (j: string) => {
    if (jurisdictions.includes(j)) {
      setJurisdictions(jurisdictions.filter((item) => item !== j))
    } else {
      setJurisdictions([...jurisdictions, j])
    }
  }

  const handleComplianceChange = (c: string) => {
    if (complianceTargets.includes(c)) {
      setComplianceTargets(complianceTargets.filter((item) => item !== c))
    } else {
      setComplianceTargets([...complianceTargets, c])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Clean systems input
    const affectedSystems = affectedSystemsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    try {
      const { sessionId } = await submitProposal({
        featureName,
        description,
        intendedUse,
        featureType,
        affectedSystems,
        dataSources,
        piiInvolved,
        thirdPartyDeps: thirdPartyDeps || undefined,
        existingRiskAssessment: existingRiskAssessment || undefined,
        jurisdiction: jurisdictions,
        complianceTargets: complianceTargets.length > 0 ? complianceTargets : undefined,
      })

      // Navigate to live review
      router.push(`/review/${sessionId}`)
    } catch (err) {
      const error = err as Error
      setError(error.message || "Failed to submit proposal")
      setSubmitting(false)
    }
  }

  const handlePrefill = () => {
    setFeatureName("Smart Customer Support Router")
    setFeatureType("model_change")
    setDescription(
      "An automated router that uses an LLM to categorize incoming support tickets and route them to the appropriate human agent department.",
    )
    setIntendedUse(
      "Used internally by the customer support platform. It reads incoming tickets and appends a 'department' tag. No customer-facing output.",
    )
    setAffectedSystemsInput("Zendesk, Support Database")
    setDataSources("Historical support tickets, customer metadata")
    setPiiInvolved("yes")
    setThirdPartyDeps("OpenAI GPT-4 API")
    setExistingRiskAssessment(
      "Standard internal data processing policy applies. Vendor assessment for OpenAI is valid until 2027.",
    )
    setJurisdictions(["US", "EU"])
    setComplianceTargets(["GDPR", "SOC2"])
  }

  return (
    <div className="relative w-full">
      {/* Header with Cancel & Prefill */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 font-bold font-mono text-[#38B0E8] text-xs uppercase hover:text-[#1F2937] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Cancel & Return
        </button>
        <button
          type="button"
          onClick={handlePrefill}
          className="rounded-[20px] bg-[#1F2937]/5 px-4 py-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase transition-all hover:bg-[#1F2937]/10"
        >
          Prefill Example
        </button>
      </div>

      <main className="mx-auto max-w-2xl pt-4">
        <div className="mb-8 space-y-1 text-center">
          <h2 className="font-black font-sans text-3xl text-[#1F2937] uppercase tracking-tight">
            PROPOSE NEW AI FEATURE
          </h2>
          <p className="font-mono text-[#1F2937]/50 text-[10px] uppercase tracking-widest">
            Governance Session submission
          </p>
        </div>

        {/* Form Steps Tracker */}
        <ProgressSteps currentStep={step} steps={steps} className="mb-8" />

        {error && (
          <div className="mb-6 rounded border border-red-500/20 bg-red-950/10 p-4 font-mono text-red-500 text-xs">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="border border-[#C7C7C7]/80 shadow-sm bg-white">
            {/* STEP 1: OVERVIEW */}
            {step === 1 && (
              <div className="space-y-6 p-2">
                <div className="flex flex-col">
                  <label htmlFor="feature-name" className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
                    Feature Name *
                  </label>
                  <input
                    id="feature-name"
                    type="text"
                    required
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    className="h-10 rounded-md border border-[#C7C7C7]/80 bg-[#FAF8F5]/50 px-3 py-2 font-sans text-[#1F2937] text-sm transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                    placeholder="e.g. Smart Customer Support Router"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="feature-type" className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
                    Feature / Change Type *
                  </label>
                  <select
                    id="feature-type"
                    value={featureType}
                    onChange={(e) =>
                      setFeatureType(
                        e.target.value as "new_feature" | "model_change" | "prompt_change" | "integration" | "other",
                      )
                    }
                    className="h-10 rounded-md border border-[#C7C7C7]/80 bg-[#FAF8F5]/50 px-3 py-2 font-mono text-[#1F2937] text-sm uppercase transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                  >
                    <option value="new_feature">New Feature</option>
                    <option value="model_change">Model Change</option>
                    <option value="prompt_change">Prompt Change</option>
                    <option value="integration">Integration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="description" className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-y rounded-md border border-[#C7C7C7]/80 bg-[#FAF8F5]/50 p-3 font-sans text-[#1F2937] text-sm transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                    placeholder="Provide a summary of the feature, models used, and business context."
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="intended-use" className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
                    Intended Use *
                  </label>
                  <textarea
                    id="intended-use"
                    required
                    rows={3}
                    value={intendedUse}
                    onChange={(e) => setIntendedUse(e.target.value)}
                    className="resize-y rounded-md border border-[#C7C7C7]/80 bg-[#FAF8F5]/50 p-3 font-sans text-[#1F2937] text-sm transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                    placeholder="Describe how users will interact with this feature and who has access."
                  />
                </div>
              </div>
            )}

            {/* STEP 2: RISK PROFILE */}
            {step === 2 && (
              <div className="space-y-6 p-2">
                <div className="flex flex-col">
                  <label
                    htmlFor="affected-systems"
                    className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase"
                  >
                    Affected Systems *
                  </label>
                  <span className="mb-1.5 font-mono text-[#1F2937]/50 text-[9px]">
                    COMMA SEPARATED LIST OF INFRASTRUCTURE
                  </span>
                  <input
                    id="affected-systems"
                    type="text"
                    required
                    value={affectedSystemsInput}
                    onChange={(e) => setAffectedSystemsInput(e.target.value)}
                    className="h-10 rounded-md border border-[#C7C7C7]/80 bg-[#FAF8F5]/50 px-3 py-2 font-mono text-[#1F2937] text-sm transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                    placeholder="e.g. ZenDesk, Customer Database, Slack Webhooks"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="data-sources" className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
                    Data Sources *
                  </label>
                  <textarea
                    id="data-sources"
                    required
                    rows={3}
                    value={dataSources}
                    onChange={(e) => setDataSources(e.target.value)}
                    className="resize-y rounded-md border border-[#C7C7C7]/80 bg-[#FAF8F5]/50 p-3 font-sans text-[#1F2937] text-sm transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                    placeholder="What databases, files, or external APIs are used during evaluation/inference?"
                  />
                </div>

                {/* Mutually exclusive options fewer than six -> Radio Buttons as per forms guide */}
                <div className="flex flex-col">
                  <span className="mb-2.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
                    PII (Personally Identifiable Information) Involved? *
                  </span>
                  <div className="flex gap-6 font-mono font-semibold text-xs">
                    {(["yes", "no", "unknown"] as const).map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2 uppercase">
                        <input
                          type="radio"
                          name="pii-involved"
                          value={opt}
                          checked={piiInvolved === opt}
                          onChange={() => setPiiInvolved(opt)}
                          className="h-4 w-4 accent-[#76E1A7]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="third-party" className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase">
                    Third Party Dependencies
                  </label>
                  <input
                    id="third-party"
                    type="text"
                    value={thirdPartyDeps}
                    onChange={(e) => setThirdPartyDeps(e.target.value)}
                    className="h-10 rounded-md border border-[#C7C7C7]/80 bg-[#FAF8F5]/50 px-3 py-2 font-sans text-[#1F2937] text-sm transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                    placeholder="e.g. OpenAI GPT-4o API, Salesforce CRM SDK"
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="risk-assessment"
                    className="mb-1.5 font-bold font-mono text-[#1F2937] text-xs uppercase"
                  >
                    Existing Risk Assessment
                  </label>
                  <textarea
                    id="risk-assessment"
                    rows={3}
                    value={existingRiskAssessment}
                    onChange={(e) => setExistingRiskAssessment(e.target.value)}
                    className="resize-y rounded-md border border-[#C7C7C7]/80 bg-[#FAF8F5]/50 p-3 font-sans text-[#1F2937] text-sm transition-all focus:border-[#1F2937] focus:ring-2 focus:ring-[#76E1A7]/30"
                    placeholder="Detail any security, ethical, or compliance review already completed."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: COMPLIANCE & JURISDICTION */}
            {step === 3 && (
              <div className="space-y-6 p-2">
                <div>
                  <span className="mb-3 block font-bold font-mono text-[#1F2937] text-xs uppercase">
                    Target Jurisdictions *
                  </span>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-3">
                    {["US", "EU", "CA", "GB", "JP", "AU"].map((j) => (
                      <label
                        key={j}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-all ${jurisdictions.includes(j) ? "border-[#1F2937] bg-white shadow-sm" : "border-[#C7C7C7]/50 bg-[#FAF8F5]/50 hover:border-[#1F2937]/30"}`}
                      >
                        <input
                          type="checkbox"
                          checked={jurisdictions.includes(j)}
                          onChange={() => handleJurisdictionChange(j)}
                          className="h-4 w-4 accent-[#76E1A7]"
                        />
                        {j}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-3 block font-bold font-mono text-[#1F2937] text-xs uppercase">
                    Applicable Compliance Targets
                  </span>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-3">
                    {["GDPR", "CCPA", "SOC2", "HIPAA", "ISO27001", "EU_AI_ACT"].map((c) => (
                      <label
                        key={c}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-all ${complianceTargets.includes(c) ? "border-[#1F2937] bg-white shadow-sm" : "border-[#C7C7C7]/50 bg-[#FAF8F5]/50 hover:border-[#1F2937]/30"}`}
                      >
                        <input
                          type="checkbox"
                          checked={complianceTargets.includes(c)}
                          onChange={() => handleComplianceChange(c)}
                          className="h-4 w-4 accent-[#76E1A7]"
                        />
                        {c.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="mt-8 flex items-center justify-between border-[#C7C7C7]/40 border-t pt-5">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[20px] border border-[#1F2937] px-5 font-bold text-[#1F2937] text-xs uppercase transition-all hover:bg-[#FAF8F5]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  PREVIOUS
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={step === 1 && !featureName.trim()}
                  className="ml-auto flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[20px] bg-[#1F2937] px-6 font-bold text-[#FAF8F5] text-xs uppercase transition-all hover:bg-[#1F2937]/90 disabled:pointer-events-none disabled:opacity-50"
                >
                  NEXT
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || jurisdictions.length === 0}
                  className="ml-auto flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[20px] bg-[#76E1A7] px-6 font-bold text-[#1F2937] text-xs uppercase transition-all hover:bg-[#8BF5BD] hover:shadow-[0_0_12px_rgba(118,225,167,0.4)] disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    <>
                      INITIALIZE SESSION
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </Card>
        </form>
      </main>
    </div>
  )
}
