"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { CheckCircle2, Loader2, Mail, Phone, Globe, Building2 } from "lucide-react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FormWithQuestions } from "../types/form"
import { getQuestionTypeEmoji } from "../lib/form-utils"
import { cn } from "@/lib/utils"

interface PublicFormRendererProps {
  form: FormWithQuestions
  source?: "qr" | "web"
}

// Font family mapping
const FONT_FAMILIES: Record<string, string> = {
  inter: "var(--font-inter), system-ui, sans-serif",
  roboto: "'Roboto', system-ui, sans-serif",
  "open-sans": "'Open Sans', system-ui, sans-serif",
  lato: "'Lato', system-ui, sans-serif",
  montserrat: "'Montserrat', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
}

export function PublicFormRenderer({
  form,
  source = "web",
}: PublicFormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const theme = form.theme || "light"
  const layout = form.layout || "centered"
  const fontFamily = form.font_family || "inter"
  const backgroundColor = form.background_color || "#ffffff"
  const buttonStyle = form.button_style || "default"
  const buttonColor = form.button_color || form.color
  const showProgress = form.show_progress !== false
  const showBranding = form.show_branding || false

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

  // Calculate progress
  const totalQuestions = form.questions.length
  const answeredQuestions = form.questions.filter((q) => {
    const value = formHook.watch(q.id!)
    return value && (Array.isArray(value) ? value.length > 0 : value !== "")
  }).length
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    } else {
      // Auto theme - use system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }, [theme])

  // Apply font family
  useEffect(() => {
    const fontFamilyValue = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.inter
    document.documentElement.style.setProperty("--form-font-family", fontFamilyValue)
  }, [fontFamily])

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

  // Get layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case "wide":
        return "max-w-4xl"
      case "full":
        return "max-w-full px-4"
      default:
        return "max-w-2xl"
    }
  }

  // Get button classes based on style
  const getButtonClasses = () => {
    const baseClasses = "w-full transition-all duration-200"
    
    switch (buttonStyle) {
      case "rounded":
        return cn(baseClasses, "rounded-lg")
      case "pill":
        return cn(baseClasses, "rounded-full")
      case "outline":
        return cn(baseClasses, "border-2 bg-transparent hover:bg-opacity-10")
      default:
        return baseClasses
    }
  }

  // Render branding section
  const renderBranding = () => {
    if (!showBranding) return null

    return (
      <div className="space-y-3 text-center">
        {form.company_logo_url && (
          <div className="flex justify-center">
            <img
              src={form.company_logo_url}
              alt={form.company_name || "Company logo"}
              className="max-h-16 max-w-full object-contain"
            />
          </div>
        )}
        {form.company_name && (
          <div className="flex items-center justify-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <p className="font-semibold text-sm">{form.company_name}</p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          {form.contact_email && (
            <a
              href={`mailto:${form.contact_email}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="size-3" />
              {form.contact_email}
            </a>
          )}
          {form.contact_phone && (
            <a
              href={`tel:${form.contact_phone}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Phone className="size-3" />
              {form.contact_phone}
            </a>
          )}
          {form.website_url && (
            <a
              href={form.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Globe className="size-3" />
              Website
            </a>
          )}
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          fontFamily: FONT_FAMILIES[fontFamily] || FONT_FAMILIES.inter
        }}
      >
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(135deg, ${form.color}08 0%, ${form.color}03 50%, ${backgroundColor || '#ffffff'} 100%)`,
          }}
        >
          {/* Animated circles for depth */}
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{ backgroundColor: form.color }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"
            style={{ backgroundColor: form.color }}
          />
        </div>

        {/* Main content */}
        <div className="w-full max-w-lg relative z-10">
          <Card
            className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl"
            style={{ 
              borderColor: `${form.color}30`,
              boxShadow: `0 20px 60px -12px ${form.color}20`
            }}
          >
            <CardContent className="pt-12 pb-8 px-8">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Success icon with animation */}
                <div className="relative">
                  <div
                    className="flex size-24 items-center justify-center rounded-full transition-all duration-500 scale-100"
                    style={{ 
                      backgroundColor: `${form.color}15`,
                      boxShadow: `0 0 0 0 ${form.color}40`
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ backgroundColor: form.color }}
                    />
                    <CheckCircle2
                      className="size-12 relative z-10"
                      style={{ color: form.color }}
                    />
                  </div>
                  {/* Ripple effect */}
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ 
                      backgroundColor: form.color,
                      animationDelay: '0.5s',
                      opacity: 0.1
                    }}
                  />
                </div>

                {/* Success message */}
                <div className="space-y-3">
                  <h2 
                    className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                  >
                    Thank you!
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                    Your response has been submitted successfully. We appreciate your time!
                  </p>
                </div>

                {/* Decorative line */}
                <div 
                  className="w-24 h-1 rounded-full"
                  style={{ backgroundColor: form.color }}
                />

                {/* Branding section */}
                {showBranding && (form.company_name || form.company_logo_url || form.contact_email || form.contact_phone || form.website_url) && (
                  <div className="pt-6 mt-6 border-t w-full border-border/50">
                    <div className="space-y-4">
                      {form.company_logo_url && (
                        <div className="flex justify-center">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <img
                              src={form.company_logo_url}
                              alt={form.company_name || "Company logo"}
                              className="max-h-12 max-w-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                      {form.company_name && (
                        <div className="flex items-center justify-center gap-2">
                          <Building2 className="size-4 text-muted-foreground" />
                          <p className="font-semibold text-base">{form.company_name}</p>
                        </div>
                      )}
                      {(form.contact_email || form.contact_phone || form.website_url) && (
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                          {form.contact_email && (
                            <a
                              href={`mailto:${form.contact_email}`}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-all hover:scale-105"
                            >
                              <Mail className="size-4" />
                              <span className="text-muted-foreground hover:text-foreground transition-colors">
                                {form.contact_email}
                              </span>
                            </a>
                          )}
                          {form.contact_phone && (
                            <a
                              href={`tel:${form.contact_phone}`}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-all hover:scale-105"
                            >
                              <Phone className="size-4" />
                              <span className="text-muted-foreground hover:text-foreground transition-colors">
                                {form.contact_phone}
                              </span>
                            </a>
                          )}
                          {form.website_url && (
                            <a
                              href={form.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-all hover:scale-105"
                            >
                              <Globe className="size-4" />
                              <span className="text-muted-foreground hover:text-foreground transition-colors">
                                Visit Website
                              </span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "min-h-screen p-4 transition-all duration-300",
        layout === "full" ? "" : "bg-gradient-to-br from-background to-muted/20"
      )}
      style={{ 
        backgroundColor: layout === "full" ? backgroundColor : undefined,
        fontFamily: FONT_FAMILIES[fontFamily] || FONT_FAMILIES.inter
      }}
    >
      <div className={cn("mx-auto py-8", getLayoutClasses())}>
        <Card 
          className={cn(
            "transition-all duration-300",
            layout === "full" && "border-0 shadow-none"
          )}
          style={{ 
            borderTopColor: form.color, 
            borderTopWidth: 4,
            backgroundColor: layout === "full" ? "transparent" : undefined
          }}
        >
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">{form.title}</CardTitle>
              {form.description && (
                <p className="text-muted-foreground text-base leading-relaxed">
                  {form.description}
                </p>
              )}
            </div>
            {showProgress && totalQuestions > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{answeredQuestions} of {totalQuestions} answered</span>
                </div>
                <div 
                  className="relative h-2 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: `${form.color}15` }}
                >
                  <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: form.color
                    }}
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {form.questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="space-y-3 transition-all duration-300"
                >
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <span className="text-lg">{getQuestionTypeEmoji(question.type)}</span>
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
                        onValueChange={(value) => {
                          formHook.setValue(question.id!, value)
                        }}
                        className="space-y-3"
                      >
                        {question.options?.map((option, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 hover:bg-accent/50",
                              formHook.watch(question.id!) === option && "border-primary bg-primary/5"
                            )}
                            style={{
                              borderColor: formHook.watch(question.id!) === option ? form.color : undefined
                            }}
                          >
                            <RadioGroupItem 
                              value={option} 
                              id={`${question.id}-${idx}`}
                              style={{ 
                                borderColor: formHook.watch(question.id!) === option ? form.color : undefined
                              }}
                            />
                            <Label
                              htmlFor={`${question.id}-${idx}`}
                              className="font-normal cursor-pointer flex-1"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === "multiple_choice" && (
                      <div className="space-y-3">
                        {question.options?.map((option, idx) => {
                          const isChecked = formHook
                            .watch(question.id!)
                            .includes(option)
                          
                          return (
                            <div 
                              key={idx} 
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 hover:bg-accent/50",
                                isChecked && "border-primary bg-primary/5"
                              )}
                              style={{
                                borderColor: isChecked ? form.color : undefined
                              }}
                            >
                              <Checkbox
                                id={`${question.id}-${idx}`}
                                checked={isChecked}
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
                                style={{ 
                                  borderColor: isChecked ? form.color : undefined
                                }}
                              />
                              <Label
                                htmlFor={`${question.id}-${idx}`}
                                className="font-normal cursor-pointer flex-1"
                              >
                                {option}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {question.type === "short_text" && (
                      <Input
                        {...formHook.register(question.id!)}
                        placeholder="Enter your answer..."
                        className="h-11 text-base"
                      />
                    )}

                    {question.type === "long_text" && (
                      <Textarea
                        {...formHook.register(question.id!)}
                        placeholder="Enter your answer..."
                        rows={5}
                        className="text-base resize-none"
                      />
                    )}
                  </div>
                ))}

              <div className="pt-6">
                <Button
                  type="submit"
                  className={getButtonClasses()}
                  disabled={isSubmitting}
                  size="lg"
                  style={{
                    backgroundColor: buttonStyle !== "outline" ? buttonColor : undefined,
                    color: buttonStyle !== "outline" ? "#ffffff" : buttonColor,
                    borderColor: buttonColor,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {showProgress ? "Submitting..." : "Please wait..."}
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
            {showBranding && (form.company_name || form.company_logo_url || form.contact_email || form.contact_phone || form.website_url) && (
              <div className="pt-6 mt-6 border-t">
                {renderBranding()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
