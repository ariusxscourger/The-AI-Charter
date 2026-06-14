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

    // If user presses Enter on an input in step 1 or 2, advance to next step instead of submitting
    if (step < 3) {
      handleNext()
      return
    }

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
    const examples = [
      {
        featureName: "Smart Customer Support Router",
        featureType: "model_change" as const,
        description: "An automated router that uses an LLM to categorize incoming support tickets and route them to the appropriate human agent department.",
        intendedUse: "Used internally by the customer support platform. It reads incoming tickets and appends a 'department' tag. No customer-facing output.",
        affectedSystemsInput: "Zendesk, Support Database",
        dataSources: "Historical support tickets, customer metadata",
        piiInvolved: "yes" as const,
        thirdPartyDeps: "OpenAI GPT-4 API",
        existingRiskAssessment: "Standard internal data processing policy applies. Vendor assessment for OpenAI is valid until 2027.",
        jurisdictions: ["US", "EU"],
        complianceTargets: ["GDPR", "SOC2"],
      },
      {
        featureName: "Clinical Trial Patient Matcher",
        featureType: "new_feature" as const,
        description: "AI model designed to match patient health records with ongoing clinical trial requirements to accelerate medical research.",
        intendedUse: "Used by clinical researchers to quickly filter candidates. Requires strict access controls and auditing.",
        affectedSystemsInput: "EHR System, Clinical Trials DB",
        dataSources: "Electronic Health Records (EHR), Medical histories",
        piiInvolved: "yes" as const,
        thirdPartyDeps: "AWS Comprehend Medical",
        existingRiskAssessment: "Data is anonymized before leaving the VPC. Requires strict BAAs.",
        jurisdictions: ["US"],
        complianceTargets: ["HIPAA", "SOC2"],
      },
      {
        featureName: "Automated Resume Screener",
        featureType: "model_change" as const,
        description: "Filters incoming job applications using an NLP model to highlight the top 10% of candidates based on job description fit.",
        intendedUse: "HR departments use it as a first-pass filter before human review. Must ensure no demographic biases.",
        affectedSystemsInput: "Workday HRIS",
        dataSources: "Candidate resumes, LinkedIn profiles",
        piiInvolved: "yes" as const,
        thirdPartyDeps: "HuggingFace Transformers",
        existingRiskAssessment: "Pending fairness and bias audit. Must comply with NYC Local Law 144.",
        jurisdictions: ["US", "EU", "GB"],
        complianceTargets: ["GDPR", "EU_AI_ACT"],
      },
      {
        featureName: "Developer Copilot Extension",
        featureType: "integration" as const,
        description: "VS Code extension that provides inline code suggestions and detects security vulnerabilities in real-time.",
        intendedUse: "Used by internal engineering teams to speed up development velocity.",
        affectedSystemsInput: "GitHub, CI/CD Pipeline",
        dataSources: "Internal Git repositories, open source code",
        piiInvolved: "no" as const,
        thirdPartyDeps: "Anthropic Claude API",
        existingRiskAssessment: "Code must not be used to train third-party models. Opt-out policies enabled on vendor API.",
        jurisdictions: ["US", "CA"],
        complianceTargets: ["ISO27001", "SOC2"],
      },
      {
        featureName: "AI Voice Assistant for Banking",
        featureType: "new_feature" as const,
        description: "A generative AI voice bot that handles tier 1 banking inquiries such as checking balances and recent transactions over the phone.",
        intendedUse: "Direct customer interaction via telephony integration. Voice data is transcribed and fed to the LLM.",
        affectedSystemsInput: "Twilio, Core Banking API",
        dataSources: "Voice recordings, Customer transaction history",
        piiInvolved: "yes" as const,
        thirdPartyDeps: "Google Cloud Speech-to-Text, OpenAI GPT-4o",
        existingRiskAssessment: "Strict data minimization applied. Voice recordings are purged after 30 days. PCI-DSS compliance required.",
        jurisdictions: ["US", "GB", "AU"],
        complianceTargets: ["SOC2", "ISO27001"],
      },
      {
        featureName: "Predictive Maintenance for Manufacturing",
        featureType: "model_change" as const,
        description: "Machine learning model analyzing IoT sensor data to predict equipment failure before it happens on the factory floor.",
        intendedUse: "Used by floor managers to schedule proactive maintenance. Outputs anomaly scores to a dashboard.",
        affectedSystemsInput: "IoT Data Lake, Maintenance Scheduler",
        dataSources: "Machine vibration, temperature, and acoustic sensors",
        piiInvolved: "no" as const,
        thirdPartyDeps: "Azure Machine Learning",
        existingRiskAssessment: "No PII involved. Security review complete. Model is isolated in a private VNET.",
        jurisdictions: ["EU", "JP"],
        complianceTargets: ["ISO27001"],
      },
      {
        featureName: "Algorithmic Trading Optimizer",
        featureType: "integration" as const,
        description: "RL agent designed to optimize trade execution routing to minimize slippage across multiple dark pools.",
        intendedUse: "Operates autonomously during market hours to execute large block trades for institutional clients.",
        affectedSystemsInput: "Order Management System, FIX Gateway",
        dataSources: "Level 3 market data, Historical order books",
        piiInvolved: "no" as const,
        thirdPartyDeps: "None (Proprietary internally trained model)",
        existingRiskAssessment: "Extensive backtesting and kill-switch implementation verified by internal risk team.",
        jurisdictions: ["US", "GB"],
        complianceTargets: ["SOC2"],
      },
      {
        featureName: "Student Essay Grader",
        featureType: "new_feature" as const,
        description: "LLM-based tool to provide preliminary grading and constructive feedback on middle-school student essays.",
        intendedUse: "Used by teachers to speed up grading. Teacher has final say and can override the AI grade.",
        affectedSystemsInput: "Canvas LMS",
        dataSources: "Student essays, grading rubrics",
        piiInvolved: "yes" as const,
        thirdPartyDeps: "Anthropic Claude API",
        existingRiskAssessment: "Must comply with COPPA and FERPA. Zero data retention policy enacted with Anthropic.",
        jurisdictions: ["US", "CA"],
        complianceTargets: ["SOC2"],
      },
      {
        featureName: "Supply Chain Logistics Predictor",
        featureType: "other" as const,
        description: "Forecasting model predicting global shipping delays based on weather, port congestion, and geopolitical news.",
        intendedUse: "Used by procurement teams to adjust inventory orders dynamically.",
        affectedSystemsInput: "SAP ERP, Global Dashboard",
        dataSources: "Public weather APIs, News feeds, Historical shipping times",
        piiInvolved: "no" as const,
        thirdPartyDeps: "Google Vertex AI",
        existingRiskAssessment: "Low risk. Output is purely advisory for internal procurement.",
        jurisdictions: ["US", "EU", "JP", "AU"],
        complianceTargets: ["ISO27001"],
      },
      {
        featureName: "Legal Document Summarizer",
        featureType: "model_change" as const,
        description: "Fine-tuned model to extract key clauses, liabilities, and dates from 100+ page enterprise contracts.",
        intendedUse: "Used by paralegals and junior associates to triage inbound contracts during M&A due diligence.",
        affectedSystemsInput: "Document Management System",
        dataSources: "Confidential corporate contracts, NDAs",
        piiInvolved: "yes" as const,
        thirdPartyDeps: "Azure OpenAI Service",
        existingRiskAssessment: "Data residency rules applied (EU data stays in EU). Model is not trained on user data.",
        jurisdictions: ["US", "EU", "GB"],
        complianceTargets: ["GDPR", "SOC2", "EU_AI_ACT"],
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)]

    setFeatureName(randomExample.featureName)
    setFeatureType(randomExample.featureType)
    setDescription(randomExample.description)
    setIntendedUse(randomExample.intendedUse)
    setAffectedSystemsInput(randomExample.affectedSystemsInput)
    setDataSources(randomExample.dataSources)
    setPiiInvolved(randomExample.piiInvolved)
    setThirdPartyDeps(randomExample.thirdPartyDeps)
    setExistingRiskAssessment(randomExample.existingRiskAssessment)
    setJurisdictions(randomExample.jurisdictions)
    setComplianceTargets(randomExample.complianceTargets)
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
