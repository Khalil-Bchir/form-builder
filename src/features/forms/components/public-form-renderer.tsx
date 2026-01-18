"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { CheckCircle2, Loader2, Mail, Phone, Globe, Building2, ChevronLeft, ChevronRight, Check } from "lucide-react"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { FormWithQuestions, FormSection } from "@/types/database.types"
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
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

  // Organize questions by section
  const sections = form.sections || []
  const questionsBySection = form.questions.reduce((acc, q) => {
    const sectionId = q.section_id || "no-section"
    if (!acc[sectionId]) {
      acc[sectionId] = []
    }
    acc[sectionId].push(q)
    return acc
  }, {} as Record<string, typeof form.questions>)

  const questionsWithoutSection = questionsBySection["no-section"] || []

  // Create a list of all sections (including a virtual section for questions without section)
  const allSections: Array<FormSection & { isVirtual?: boolean }> = [
    ...sections,
    ...(questionsWithoutSection.length > 0
      ? [
          {
            id: "no-section",
            title: "Questions générales",
            description: "",
            order: sections.length,
            isVirtual: true,
          } as FormSection & { isVirtual: boolean },
        ]
      : []),
  ].sort((a, b) => a.order - b.order)

  // Get current section
  const currentSection = allSections[currentSectionIndex]
  const currentSectionQuestions =
    currentSection?.isVirtual
      ? questionsWithoutSection
      : questionsBySection[currentSection?.id || ""] || []

  // Calculate section progress
  const totalSections = allSections.length
  const sectionProgress = totalSections > 0 ? ((currentSectionIndex + 1) / totalSections) * 100 : 0

  const theme = form.theme || "light"
  const layout = form.layout || "centered"
  const fontFamily = form.font_family || "inter"
  const backgroundColor = form.background_color || "#ffffff"
  const buttonStyle = form.button_style || "default"
  const showProgress = form.show_progress !== false
  const showBranding = form.show_branding || false
  
  // Convert null to undefined for React style props
  const formColor = form.color ?? undefined
  const formBackgroundColor = form.background_color ?? undefined
  const formButtonColor = form.button_color ?? undefined
  const buttonColor = formButtonColor || formColor || undefined

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

  // Calculate overall progress - watch all form values at once to avoid multiple subscriptions
  const formValues = formHook.watch()
  const totalQuestions = form.questions.length
  const answeredQuestions = form.questions.filter((q) => {
    const value = formValues[q.id!]
    return value && (Array.isArray(value) ? value.length > 0 : value !== "")
  }).length
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  // Validate current section
  const validateCurrentSection = (): boolean => {
    const currentValues = formHook.getValues()
    for (const question of currentSectionQuestions) {
      if (question.required) {
        const value = currentValues[question.id!]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setError(`Veuillez répondre à la question obligatoire : ${question.text}`)
          return false
        }
      }
    }
    return true
  }

  // Navigate to next section
  const handleNext = () => {
    if (!validateCurrentSection()) {
      return
    }
    setError(null)
    if (currentSectionIndex < allSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Navigate to previous section
  const handlePrevious = () => {
    setError(null)
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

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
            setError(`Veuillez répondre à la question obligatoire : ${question.text}`)
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
        throw new Error(errorData.error || "Échec de l'envoi du formulaire")
      }

      setIsSubmitted(true)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite. Veuillez réessayer."
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
      <div className="space-y-3 sm:space-y-4">
        {form.company_logo_url && (
          <div className="flex justify-center">
            <img
              src={form.company_logo_url || "/placeholder.svg"}
              alt={form.company_name || "Company logo"}
              className="max-h-10 sm:max-h-12 max-w-full object-contain"
            />
          </div>
        )}
        {form.company_name && (
          <div className="flex items-center justify-center gap-2">
            <Building2 className="size-3 sm:size-4 text-muted-foreground" />
            <p className="font-semibold text-xs sm:text-sm">{form.company_name}</p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          {form.contact_email && (
            <a
              href={`mailto:${form.contact_email}`}
              className="flex items-center gap-1.5 sm:gap-2 hover:text-foreground transition-colors"
            >
              <Mail className="size-3 sm:size-4" />
              <span className="hidden sm:inline">{form.contact_email}</span>
              <span className="sm:hidden">Email</span>
            </a>
          )}
          {form.contact_phone && (
            <a
              href={`tel:${form.contact_phone}`}
              className="flex items-center gap-1.5 sm:gap-2 hover:text-foreground transition-colors"
            >
              <Phone className="size-3 sm:size-4" />
              <span className="hidden sm:inline">{form.contact_phone}</span>
              <span className="sm:hidden">Tél</span>
            </a>
          )}
          {form.website_url && (
            <a
              href={form.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 hover:text-foreground transition-colors"
            >
              <Globe className="size-3 sm:size-4" />
              <span className="hidden sm:inline">Site web</span>
              <span className="sm:hidden">Web</span>
            </a>
          )}
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          fontFamily: FONT_FAMILIES[fontFamily] || FONT_FAMILIES.inter,
          backgroundColor: backgroundColor || "#ffffff"
        }}
      >
        {/* Main content */}
        <div className="w-full max-w-lg">
          <div
            className="border border-border rounded p-8 sm:p-12"
            style={{ 
              backgroundColor: backgroundColor || "#ffffff"
            }}
          >
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Success icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className="flex size-16 items-center justify-center rounded-full"
                    style={{ 
                      backgroundColor: formColor ? `${formColor}15` : undefined
                    }}
                  >
                    <CheckCircle2
                      className="size-8"
                      style={{ color: formColor || "var(--color-primary)" }}
                    />
                  </div>
                </div>

                {/* Success message */}
                <div className="space-y-3">
                  <h2 
                    className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                  >
                    Merci !
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto">
                    Votre réponse a été soumise avec succès. Nous apprécions votre temps !
                  </p>
                </div>

                {/* Decorative line */}
                <div 
                  className="w-24 h-0.5 mx-auto"
                  style={{ backgroundColor: formColor || "var(--color-primary)" }}
                />

                {/* Branding section */}
                {showBranding && (form.company_name || form.company_logo_url || form.contact_email || form.contact_phone || form.website_url) && (
                  <div className="pt-6 mt-6 border-t w-full border-border">
                    <div className="space-y-4">
                      {form.company_logo_url && (
                        <div className="flex justify-center">
                          <img
                            src={form.company_logo_url || "/placeholder.svg"}
                            alt={form.company_name || "Company logo"}
                            className="max-h-12 max-w-full object-contain"
                          />
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
                              className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-muted/50"
                            >
                              <Mail className="size-4" />
                              <span className="text-muted-foreground">
                                {form.contact_email}
                              </span>
                            </a>
                          )}
                          {form.contact_phone && (
                            <a
                              href={`tel:${form.contact_phone}`}
                              className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-muted/50"
                            >
                              <Phone className="size-4" />
                              <span className="text-muted-foreground">
                                {form.contact_phone}
                              </span>
                            </a>
                          )}
                          {form.website_url && (
                            <a
                              href={form.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-muted/50"
                            >
                              <Globe className="size-4" />
                              <span className="text-muted-foreground">
                                Visiter le site web
                              </span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: backgroundColor || "#ffffff",
        fontFamily: FONT_FAMILIES[fontFamily] || FONT_FAMILIES.inter
      }}
    >
      <div className="flex max-w-7xl mx-auto">
        {/* Step Counter - Left Side */}
        {totalSections > 1 && (
          <div className="hidden lg:flex w-1/5 flex-shrink-0 pl-4 xl:pl-8 pr-4 xl:pr-6 sticky top-0 h-screen items-center justify-center">
            <div className="flex flex-col items-center">
              {allSections.map((section, index) => {
                const isCurrent = index === currentSectionIndex
                const isCompleted = index < currentSectionIndex
                const isFuture = index > currentSectionIndex
                const stepColor = formColor
                
                return (
                  <div key={section.id || index} className="relative flex flex-col items-center">
                    {/* Step circle */}
                    <div 
                      className={cn(
                        "w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs lg:text-sm font-semibold transition-all duration-300 relative z-10",
                        isCompleted && "bg-primary text-primary-foreground shadow-md",
                        isCurrent && "bg-primary text-primary-foreground shadow-lg ring-2 lg:ring-4 ring-primary/25",
                        isFuture && "border-2 border-border bg-background text-muted-foreground"
                      )}
                      style={stepColor ? {
                        ...(isCompleted || isCurrent ? {
                          backgroundColor: stepColor,
                          color: "var(--color-primary-foreground)",
                          ...(isCurrent && {
                            boxShadow: `0 0 0 4px ${stepColor}40, var(--shadow-lg)`
                          })
                        } : {})
                      } : {}}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    {/* Connecting line */}
                    {index < allSections.length - 1 && (
                      <div className="relative w-0.5 -mt-5 lg:-mt-6 mb-0 h-16 lg:h-20">
                        {/* Background line */}
                        <div className="absolute inset-0 bg-border" />
                        {/* Progress line */}
                        {isCompleted && (
                          <div 
                            className={cn(
                              "absolute inset-0 transition-all duration-500",
                              stepColor ? "" : "bg-primary"
                            )}
                            style={stepColor ? { 
                              backgroundColor: stepColor,
                              height: "100%"
                            } : { height: "100%" }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Vertical Separator */}
        {totalSections > 1 && (
          <div className="hidden lg:flex items-center justify-center sticky top-0 h-screen">
            <div className="w-px flex-shrink-0 h-[80%] bg-border" />
          </div>
        )}
        
        {/* Main Content - Right Side */}
        <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto w-full">
              {/* Mobile Step Indicator */}
              {totalSections > 1 && (
                <div className="lg:hidden mb-6 pb-4 border-b border-border">
                  <div className="relative flex items-center justify-between mb-3">
                    {/* Background line */}
                    <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-border" />
                    {/* Progress line */}
                    {currentSectionIndex > 0 && (
                      <div 
                        className="absolute top-4 sm:top-5 left-0 h-0.5 transition-all duration-500"
                        style={{ 
                          width: `${(currentSectionIndex / (totalSections - 1)) * 100}%`,
                          backgroundColor: formColor || "var(--color-primary)"
                        }}
                      />
                    )}
                    {allSections.map((section, index) => {
                      const isCurrent = index === currentSectionIndex
                      const isCompleted = index < currentSectionIndex
                      const stepColor = formColor
                      
                      return (
                        <div key={section.id || index} className="relative z-10">
                          <div 
                            className={cn(
                              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300",
                              isCompleted && "bg-primary text-primary-foreground",
                              isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/25",
                              !isCompleted && !isCurrent && "border-2 border-border bg-background text-muted-foreground"
                            )}
                            style={stepColor && (isCompleted || isCurrent) ? {
                              backgroundColor: stepColor,
                              color: "var(--color-primary-foreground)"
                            } : {}}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Étape {currentSectionIndex + 1} sur {totalSections}
                  </p>
                </div>
              )}
              
              {/* Form Header */}
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">{form.title}</h1>
                {form.description && (
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {form.description}
                  </p>
                )}
              </div>
            
            <form id="form-submit" onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              {error && (
                <div className="p-3 sm:p-4 mb-4 sm:mb-6 border border-destructive/50 bg-destructive/10 rounded text-sm">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Section header */}
              {currentSection && (
                <div className="space-y-2 pb-4 sm:pb-6 border-b border-border">
                  <h2 className="text-xl sm:text-2xl font-semibold">{currentSection.title}</h2>
                  {currentSection.description && (
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {currentSection.description}
                    </p>
                  )}
                </div>
              )}

              {/* Current section questions */}
              {currentSectionQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucune question dans cette section</p>
                </div>
              ) : (
                currentSectionQuestions.map((question, index) => (
                <div 
                  key={question.id} 
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

                  {question.type === "single_choice" && (
                    <RadioGroup
                      value={formValues[question.id!] || ""}
                      onValueChange={(value) => {
                        formHook.setValue(question.id!, value, { shouldValidate: false })
                      }}
                      className="space-y-2.5"
                    >
                      {question.options?.map((option, idx) => {
                        const currentValue = formValues[question.id!]
                        const isSelected = currentValue === option
                        return (
                          <div 
                            key={idx} 
                            className={cn(
                              "flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all duration-200 cursor-pointer group",
                              isSelected 
                                ? "bg-primary/10" 
                                : "hover:bg-muted/50"
                            )}
                          >
                            <RadioGroupItem 
                              value={option} 
                              id={`${question.id}-${idx}`}
                              style={{ 
                                borderColor: isSelected ? formColor : undefined,
                                color: isSelected ? formColor : undefined
                              }}
                              className="transition-all duration-200 flex-shrink-0"
                            />
                            <Label
                              htmlFor={`${question.id}-${idx}`}
                              className="font-normal cursor-pointer flex-1 text-sm sm:text-base"
                            >
                              {option}
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  )}

                  {question.type === "multiple_choice" && (
                    <div className="space-y-2.5">
                      {question.options?.map((option, idx) => {
                        const currentValue = formValues[question.id!] || []
                        const isChecked = Array.isArray(currentValue) && currentValue.includes(option)
                        
                        return (
                          <div 
                            key={idx} 
                            className={cn(
                              "flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all duration-200 cursor-pointer group",
                              isChecked 
                                ? "bg-primary/10" 
                                : "hover:bg-muted/50"
                            )}
                          >
                            <Checkbox
                              id={`${question.id}-${idx}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current = formHook.getValues(question.id!) || []
                                if (checked) {
                                  formHook.setValue(question.id!, [...(Array.isArray(current) ? current : []), option], { shouldValidate: false })
                                } else {
                                  formHook.setValue(
                                    question.id!,
                                    (Array.isArray(current) ? current : []).filter((v: string) => v !== option),
                                    { shouldValidate: false }
                                  )
                                }
                              }}
                              style={{ 
                                borderColor: isChecked ? formColor : undefined,
                                backgroundColor: isChecked ? formColor : undefined
                              }}
                              className="transition-all duration-200 flex-shrink-0"
                            />
                            <Label
                              htmlFor={`${question.id}-${idx}`}
                              className="font-normal cursor-pointer flex-1 text-sm sm:text-base"
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
                      placeholder="Entrez votre réponse..."
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  )}

                  {question.type === "long_text" && (
                    <Textarea
                      {...formHook.register(question.id!)}
                      placeholder="Entrez votre réponse..."
                      rows={4}
                      className="text-sm sm:text-base resize-none"
                    />
                  )}
                </div>
                ))
              )}

            </form>
            </div>
            
            {/* Footer with Navigation */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                {currentSectionIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-border rounded-md bg-background hover:bg-muted/50 text-sm font-medium transition-colors"
                  >
                    <ChevronLeft className="inline mr-2 h-4 w-4" />
                    Précédent
                  </button>
                )}
                {currentSectionIndex < allSections.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md text-sm font-medium text-white transition-colors"
                    style={{ 
                      backgroundColor: buttonColor || "var(--color-primary)"
                    }}
                  >
                    Suivant
                    <ChevronRight className="inline ml-2 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="form-submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ 
                      backgroundColor: buttonColor || "var(--color-primary)"
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      formHook.handleSubmit(onSubmit)()
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      "Soumettre"
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Branding */}
            {showBranding && (form.company_name || form.company_logo_url || form.contact_email || form.contact_phone || form.website_url) && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
                {renderBranding()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
