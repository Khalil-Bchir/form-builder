"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, FileQuestion, Palette, QrCode } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StepIndicator } from "./step-indicator"
import { FormBuilderContent } from "./form-builder-content"
import { FormCustomizationContent } from "./form-customization-content"
import { FormPublishContent } from "./form-publish-content"
import { generateSlug } from "../lib/form-utils"
import type { FormQuestionWithOptions, FormSection, Form } from "@/types/database.types"
import { Card } from "@/components/ui/card"

interface UnifiedFormEditorProps {
  formId?: string
  form?: Form
  initialTitle?: string
  initialDescription?: string
  initialQuestions?: FormQuestionWithOptions[]
  initialSections?: FormSection[]
  onSave: (data: {
    title: string
    description?: string
    questions: Omit<FormQuestionWithOptions, "id" | "form_id" | "created_at">[]
    sections: Omit<FormSection, "id" | "form_id" | "created_at" | "updated_at">[]
  }) => Promise<void>
}

const STEPS = [
  { number: 1, title: "Données du formulaire", description: "Questions et sections" },
  { number: 2, title: "Personnalisation", description: "Style et apparence" },
  { number: 3, title: "Publication", description: "Publier et partager" },
]

export function UnifiedFormEditor({
  formId,
  form,
  initialTitle = "",
  initialDescription = "",
  initialQuestions = [],
  initialSections = [],
  onSave,
}: UnifiedFormEditorProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1) // Always start at step 1 for new forms
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [questions, setQuestions] = useState<FormQuestionWithOptions[]>(initialQuestions)
  const [sections, setSections] = useState<FormSection[]>(initialSections)
  const [isSaving, setIsSaving] = useState(false)
  const [currentFormId, setCurrentFormId] = useState(formId)
  const [currentForm, setCurrentForm] = useState(form)
  const [completedSteps, setCompletedSteps] = useState<number[]>(formId ? [1] : [])

  // Update form state when props change (after save/refresh)
  useEffect(() => {
    if (formId && formId !== currentFormId) {
      setCurrentFormId(formId)
      setCompletedSteps([1])
      // Auto-advance to step 2 after saving step 1
      if (currentStep === 1) {
        setCurrentStep(2)
      }
    }
    if (form) {
      setCurrentForm(form)
      // If form exists, mark step 1 as completed
      if (form.id && !completedSteps.includes(1)) {
        setCompletedSteps([1])
      }
    }
  }, [formId, form, currentFormId, currentStep, completedSteps])

  const handleSave = async (): Promise<boolean> => {
    if (!title.trim()) {
      toast.error("Veuillez entrer un titre de formulaire")
      return false
    }

    setIsSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questions.map((q, index) => ({
          ...q,
          order: index,
        })),
        sections: sections.map((s, index) => ({
          title: s.title,
          description: s.description ?? null,
          order: index,
        })),
      })
      toast.success("Formulaire enregistré avec succès")
      // Refresh to get the new form ID
      router.refresh()
      return true
    } catch (error) {
      toast.error("Échec de l'enregistrement du formulaire")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      // Step 1: Save form as draft before proceeding
      const saved = await handleSave()
      if (saved) {
        setCompletedSteps([1])
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      // Step 2: Move to step 3
      setCompletedSteps([1, 2])
      setCurrentStep(3)
    }
  }

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    }
  }

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Step 1 requires title
      return title.trim().length > 0
    }
    // Steps 2 and 3 can always proceed (form is already saved)
    return true
  }

  // Create a draft form object for customization and publishing steps
  const draftForm: Form | null = currentForm || (currentFormId ? null : {
    id: "",
    title: title || "Nouveau formulaire",
    description: description || null,
    slug: title ? generateSlug(title) : "nouveau-formulaire",
    status: "draft" as const,
    user_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    color: null,
    theme: null,
    layout: null,
    font_family: null,
    background_color: null,
    button_style: null,
    button_color: null,
    show_progress: null,
    company_name: null,
    company_logo_url: null,
    contact_email: null,
    contact_phone: null,
    website_url: null,
    show_branding: null,
  } as Form)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            {formId ? "Modifier le formulaire" : "Créer un nouveau formulaire"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {formId ? "Gérez votre formulaire" : "Suivez les étapes pour créer votre formulaire"}
          </p>
        </div>

        {/* Step Indicator */}
        {/* <div className="flex-shrink-0">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div> */}
      </div>

      <Separator />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <Card>
            <FormBuilderContent
              formId={currentFormId}
              title={title}
              description={description}
              questions={questions}
              sections={sections}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onQuestionsChange={setQuestions}
              onSectionsChange={setSections}
            />
          </Card>
        )}

        {currentStep === 2 && draftForm && (
          <FormCustomizationContent
            form={draftForm}
            isDraft={!currentFormId}
            title={title}
            onSave={async () => {
              await handleSave()
            }}
            isSaving={isSaving}
          />
        )}

        {currentStep === 3 && draftForm && (
          <FormPublishContent
            form={draftForm}
            isDraft={!currentFormId}
            title={title}
            description={description}
            questions={questions}
            sections={sections}
            onSave={async () => {
              await handleSave()
            }}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isSaving}
            >
              <ChevronLeft className="size-4 mr-2" />
              Précédent
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/forms")}
            disabled={isSaving}
          >
            Annuler
          </Button>
          {currentStep < 3 && (
            <Button
              onClick={handleNext}
              disabled={isSaving || !canProceedToNextStep()}
            >
              {currentStep === 1 ? "Enregistrer et continuer" : "Suivant"}
              <ChevronRight className="size-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
