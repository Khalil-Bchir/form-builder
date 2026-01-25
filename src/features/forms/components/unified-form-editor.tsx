"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, FileQuestion, Palette, QrCode } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
    formId?: string
    title: string
    description?: string
    questions: Omit<FormQuestionWithOptions, "id" | "form_id" | "created_at">[]
    sections: Omit<FormSection, "id" | "form_id" | "created_at" | "updated_at">[]
  }) => Promise<void>
}

const TABS = [
  { value: "1", label: "Création", description: "Titre, description et questions" },
  { value: "2", label: "Personnalisation", description: "Style et apparence" },
  { value: "3", label: "Aperçu", description: "Prévisualiser et publier" },
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
  const [activeTab, setActiveTab] = useState("1") // Always start at tab 1 for new forms
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [questions, setQuestions] = useState<FormQuestionWithOptions[]>(initialQuestions)
  const [sections, setSections] = useState<FormSection[]>(initialSections)
  const [isSaving, setIsSaving] = useState(false)
  const [currentFormId, setCurrentFormId] = useState(formId)
  const [currentForm, setCurrentForm] = useState(form)
  const [savePersonalizationFn, setSavePersonalizationFn] = useState<(() => Promise<boolean>) | null>(null)
  
  // Determine if we're editing an existing form
  const isEditingExistingForm = !!formId && !!form?.id

  // Update when formId changes
  useEffect(() => {
    if (formId && formId !== currentFormId) {
      setCurrentFormId(formId)
    }
  }, [formId, currentFormId])

  // Update form object when it changes - use ref to prevent unnecessary updates
  const prevFormIdRef = useRef<string | undefined>(form?.id)
  useEffect(() => {
    if (form?.id && form.id !== prevFormIdRef.current) {
      prevFormIdRef.current = form.id
      setCurrentForm(form)
    }
  }, [form?.id])

  const handleSave = async (): Promise<boolean> => {
    if (!title.trim()) {
      toast.error("Veuillez entrer un titre de formulaire")
      return false
    }

    setIsSaving(true)
    try {
      // Clean up questions data - remove undefined options and other unnecessary fields
      const cleanedQuestions = questions.map((q, index) => {
        // Handle options - ensure it's a valid array or null
        let optionsValue: string[] | null = null
        if (q.type === "single_choice" || q.type === "multiple_choice") {
          // For choice questions, only include options if they're a valid array
          if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            optionsValue = q.options
          } else {
            optionsValue = null
          }
        }

        // Handle section_id - only include if it's a valid UUID (not temp- or empty)
        let sectionIdValue: string | null = null
        if (q.section_id && 
            q.section_id !== "" && 
            !q.section_id.startsWith("temp-") &&
            !q.section_id.startsWith("order-")) {
          sectionIdValue = q.section_id
        }

        return {
          order: index,
          type: q.type,
          text: q.text,
          required: q.required ?? false,
          options: optionsValue,
          section_id: sectionIdValue,
        }
      })

      // Clean up sections data
      const cleanedSections = sections.map((s, index) => ({
        title: s.title,
        description: s.description ?? null,
        order: index,
      }))

      await onSave({
        formId: currentFormId || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        questions: cleanedQuestions,
        sections: cleanedSections,
      })
      toast.success("Formulaire enregistré avec succès")
      // Refresh to get the new form ID and data
      router.refresh()
      return true
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Échec de l'enregistrement du formulaire")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleTabChange = async (value: string) => {
    // When switching to tab 2 or 3, ensure form is saved first (for new forms)
    if (!isEditingExistingForm && value !== "1" && !currentFormId) {
      if (!title.trim()) {
        toast.error("Veuillez d'abord ajouter un titre au formulaire")
        return
      }
      const saved = await handleSave()
      if (!saved) {
        return
      }
    }
    setActiveTab(value)
  }

  // Create a stable draft form object for customization and publishing steps
  // Use useMemo with proper dependencies to prevent unnecessary recreations
  type DraftForm = Omit<Form, 'id' | 'user_id'> & { id?: string; user_id?: string }
  
  // Memoize draftForm to prevent infinite loops - only recreate when form ID or essential data changes
  const draftForm: Form | DraftForm | null = useMemo(() => {
    if (currentForm) {
      return currentForm
    }
    
    if (currentFormId) return null
    
    return {
      title: title || "Nouveau formulaire",
      description: description || null,
      slug: title ? generateSlug(title) : "nouveau-formulaire",
      status: "draft" as const,
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
    } as DraftForm
  }, [currentForm?.id, currentFormId, title, description]) // Only depend on form.id, not the whole object

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
      </div>

      <Separator />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6 min-h-[400px]">
          <TabsContent value="1" className="mt-0">
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
          </TabsContent>

          <TabsContent value="2" className="mt-0">
            {draftForm && (
              <FormCustomizationContent
                key={currentForm?.id || "draft"} // Key to force remount when form changes
                form={draftForm as Form | DraftForm}
                isDraft={!currentFormId}
                title={title}
                onSave={async () => {
                  await handleSave()
                }}
                isSaving={isSaving}
                onPersonalizationSaveReady={(saveFn) => {
                  setSavePersonalizationFn(() => saveFn)
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="3" className="mt-0">
            {draftForm && (
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
          </TabsContent>
        </div>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/forms")}
          disabled={isSaving}
        >
          {isEditingExistingForm ? "Retour" : "Annuler"}
        </Button>
        
        {activeTab === "1" && (
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        )}
      </div>
    </div>
  )
}
