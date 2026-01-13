"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FormWithQuestions } from "../types/form"
import { getQuestionTypeEmoji } from "../lib/form-utils"

interface PublicFormRendererProps {
  form: FormWithQuestions
  source?: "qr" | "web"
}

export function PublicFormRenderer({
  form,
  source = "web",
}: PublicFormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formHook = useForm({
    defaultValues: form.questions.reduce((acc, q) => {
      if (q.type === "multiple_choice") {
        acc[q.id!] = []
      } else {
        acc[q.id!] = ""
      }
      return acc
    }, {} as Record<string, any>),
  })

  const onSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      for (const question of form.questions) {
        if (question.required) {
          const value = data[question.id!]
          if (!value || (Array.isArray(value) && value.length === 0)) {
            setError(`Please answer the required question: ${question.text}`)
            setIsSubmitting(false)
            return
          }
        }
      }

      const response = await fetch(`/api/submit/${form.slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: form.id,
          answers: form.questions.map((q) => ({
            questionId: q.id,
            answer: data[q.id!],
          })),
          source,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit form")
      }

      setIsSubmitted(true)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Thank you!</h2>
                <p className="text-muted-foreground mt-2">
                  Your response has been submitted successfully.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card style={{ borderTopColor: form.color, borderTopWidth: 4 }}>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-2xl">{form.title}</CardTitle>
              {form.description && (
                <p className="text-muted-foreground">{form.description}</p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {form.questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-base flex items-center gap-2">
                    <span>{getQuestionTypeEmoji(question.type)}</span>
                    <span>
                      {question.text}
                      {question.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </span>
                  </Label>

                  {question.type === "single_choice" && (
                    <RadioGroup
                      value={formHook.watch(question.id!)}
                      onValueChange={(value) =>
                        formHook.setValue(question.id!, value)
                      }
                    >
                      {question.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                          <Label
                            htmlFor={`${question.id}-${idx}`}
                            className="font-normal cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "multiple_choice" && (
                    <div className="space-y-2">
                      {question.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${idx}`}
                            checked={formHook
                              .watch(question.id!)
                              .includes(option)}
                            onCheckedChange={(checked) => {
                              const current = formHook.watch(question.id!) || []
                              if (checked) {
                                formHook.setValue(question.id!, [...current, option])
                              } else {
                                formHook.setValue(
                                  question.id!,
                                  current.filter((v: string) => v !== option)
                                )
                              }
                            }}
                          />
                          <Label
                            htmlFor={`${question.id}-${idx}`}
                            className="font-normal cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "short_text" && (
                    <Input
                      {...formHook.register(question.id!)}
                      placeholder="Enter your answer..."
                    />
                  )}

                  {question.type === "long_text" && (
                    <Textarea
                      {...formHook.register(question.id!)}
                      placeholder="Enter your answer..."
                      rows={4}
                    />
                  )}
                </div>
              ))}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
