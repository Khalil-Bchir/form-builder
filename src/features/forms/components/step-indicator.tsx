"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  completedSteps?: number[]
  onStepClick?: (stepNumber: number) => void
  allowStepNavigation?: boolean
}

export function StepIndicator({ 
  steps, 
  currentStep, 
  completedSteps = [],
  onStepClick,
  allowStepNavigation = false
}: StepIndicatorProps) {
  const handleStepClick = (stepNumber: number) => {
    if (allowStepNavigation && onStepClick && stepNumber !== currentStep) {
      onStepClick(stepNumber)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number) || step.number < currentStep
          const isCurrent = step.number === currentStep
          const isFuture = step.number > currentStep
          const isClickable = allowStepNavigation && step.number !== currentStep

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  onClick={() => handleStepClick(step.number)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 relative z-10 border-2",
                    isCompleted && "bg-primary text-primary-foreground border-primary",
                    isCurrent && "bg-primary text-primary-foreground border-primary ring-4 ring-primary/25",
                    isFuture && "border-border bg-background text-muted-foreground",
                    isClickable && "cursor-pointer hover:scale-110 hover:ring-2 hover:ring-primary/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-foreground",
                      isCompleted && "text-foreground",
                      isFuture && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 relative">
                  <div className="absolute inset-0 bg-border" />
                  {isCompleted && (
                    <div className="absolute inset-0 bg-primary transition-all duration-500" />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
