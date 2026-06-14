import React from "react"
import { cn } from "@/lib/utils"

interface ProgressStepsProps {
  currentStep: number
  steps: string[]
  className?: string
}

export function ProgressSteps({ currentStep, steps, className }: ProgressStepsProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <nav aria-label="Progress">
        <ol className="flex w-full items-center justify-between font-mono font-semibold text-xs">
          {steps.map((step, idx) => {
            const stepNum = idx + 1
            const isCompleted = stepNum < currentStep
            const isActive = stepNum === currentStep

            return (
              <React.Fragment key={step}>
                <li
                  className="relative flex flex-col items-center z-10"
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Step Marker */}
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-sm transition-all duration-300",
                      isCompleted &&
                        "border-[#76E1A7] bg-[#76E1A7] text-[#1F2937] shadow-[0_0_12px_rgba(118,225,167,0.4)]",
                      isActive && "border-[#76E1A7] bg-[#1F2937] font-bold text-[#76E1A7] ring-2 ring-[#76E1A7]/20",
                      !isActive && !isCompleted && "border-[#C7C7C7] bg-[#FAF8F5] text-[#C7C7C7]",
                    )}
                  >
                    {stepNum}
                  </span>
                  <span
                    className={cn(
                      "mt-2 absolute top-full w-32 text-center text-[10px] uppercase tracking-wider hidden sm:block",
                      isActive && "font-bold text-[#1F2937]",
                      isCompleted && "text-[#76E1A7]",
                      !isActive && !isCompleted && "text-[#C7C7C7]",
                    )}
                  >
                    {step}
                  </span>
                </li>

                {/* Step Connector Line */}
                {idx !== steps.length - 1 && (
                  <li
                    className={cn(
                      "flex-1 mx-2 h-[2px] transition-colors duration-300 z-0",
                      isCompleted ? "bg-[#76E1A7]" : "bg-[#C7C7C7]/50"
                    )}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
