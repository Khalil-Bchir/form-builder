"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { FormQuestion } from "../types/form"
import { getQuestionTypeEmoji } from "../lib/form-utils"

interface QuestionPreviewProps {
  question: FormQuestion
  index: number
}

export function QuestionPreview({ question, index }: QuestionPreviewProps) {
  const renderQuestion = () => {
    switch (question.type) {
      case "single_choice":
        return (
          <RadioGroup>
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "multiple_choice":
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox id={`checkbox-${idx}`} />
                <Label htmlFor={`checkbox-${idx}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case "short_text":
        return <Input placeholder="Enter your answer..." disabled />

      case "long_text":
        return <Textarea placeholder="Enter your answer..." disabled rows={4} />

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{getQuestionTypeEmoji(question.type)}</span>
              <span>
                {question.text}
                {question.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </span>
            </CardTitle>
          </div>
          <Badge variant="secondary">Question {index + 1}</Badge>
        </div>
      </CardHeader>
      <CardContent>{renderQuestion()}</CardContent>
    </Card>
  )
}
