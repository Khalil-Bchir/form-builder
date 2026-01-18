"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { FormQuestionWithOptions } from "@/types/database.types"
import { getQuestionTypeEmoji } from "../lib/form-utils"
import { cn } from "@/lib/utils"

interface QuestionPreviewProps {
  question: FormQuestionWithOptions
  index: number
}

export function QuestionPreview({ question, index }: QuestionPreviewProps) {
  const renderQuestion = () => {
    switch (question.type) {
      case "single_choice":
        return (
          <RadioGroup
            value=""
            className="space-y-2.5"
          >
            {question.options?.map((option, idx) => (
              <div 
                key={idx} 
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all duration-200 cursor-pointer group hover:bg-muted/50"
              >
                <RadioGroupItem 
                  value={option} 
                  id={`preview-${index}-${idx}`}
                  disabled
                  className="transition-all duration-200 flex-shrink-0"
                />
                <Label
                  htmlFor={`preview-${index}-${idx}`}
                  className="font-normal cursor-pointer flex-1 text-sm sm:text-base"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "multiple_choice":
        return (
          <div className="space-y-2.5">
            {question.options?.map((option, idx) => (
              <div 
                key={idx} 
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all duration-200 cursor-pointer group hover:bg-muted/50"
              >
                <Checkbox
                  id={`preview-${index}-${idx}`}
                  disabled
                  className="transition-all duration-200 flex-shrink-0"
                />
                <Label
                  htmlFor={`preview-${index}-${idx}`}
                  className="font-normal cursor-pointer flex-1 text-sm sm:text-base"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "short_text":
        return (
          <Input 
            placeholder="Entrez votre réponse..." 
            disabled 
            className="h-10 sm:h-11 text-sm sm:text-base"
          />
        )

      case "long_text":
        return (
          <Textarea 
            placeholder="Entrez votre réponse..." 
            disabled 
            rows={4}
            className="text-sm sm:text-base resize-none"
          />
        )

      default:
        return null
    }
  }

  return (
    <div 
      className="space-y-3 py-4 sm:py-6 border-b border-border last:border-b-0"
    >
      <Label className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2 sm:gap-2.5 flex-wrap text-foreground">
        <span className="text-base sm:text-lg md:text-xl">{getQuestionTypeEmoji(question.type)}</span>
        <span className="break-words">
          {question.text}
          {question.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </span>
      </Label>
      {renderQuestion()}
    </div>
  )
}
