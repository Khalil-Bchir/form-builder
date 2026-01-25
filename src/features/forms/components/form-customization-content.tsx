"use client"

import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FormSettings, type FormSettingsRef } from "./form-settings"
import type { Form } from "@/types/database.types"

// DraftForm type for forms without database-generated id
type DraftForm = Omit<Form, "id" | "user_id"> & { id?: string; user_id?: string }

interface FormCustomizationContentProps {
  form: Form | DraftForm
  isDraft?: boolean
  title?: string
  onSave?: () => Promise<void>
  isSaving?: boolean
  onPersonalizationSaveReady?: (saveFn: () => Promise<boolean>) => void
}

export function FormCustomizationContent({ 
  form, 
  isDraft = false,
  title,
  onSave,
  isSaving = false,
  onPersonalizationSaveReady
}: FormCustomizationContentProps) {
  const router = useRouter()
  const formSettingsRef = useRef<FormSettingsRef>(null)

  const handleUpdate = () => {
    if (isDraft && onSave) {
      // Auto-save if it's a draft
      onSave().then(() => {
        router.refresh()
      })
    } else {
      router.refresh()
    }
  }

  // Expose save function to parent
  useEffect(() => {
    if (onPersonalizationSaveReady && formSettingsRef.current) {
      onPersonalizationSaveReady(() => formSettingsRef.current?.savePersonalization() || Promise.resolve(false))
    }
  }, [onPersonalizationSaveReady, form?.id])

  // Check if form has a title (either from form.title or passed title prop)
  const hasTitle = (form.title && form.title.trim().length > 0) || (title && title.trim().length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Personnalisation du formulaire</h2>
        <p className="text-sm text-muted-foreground">
          Personnalisez l'apparence et le style de votre formulaire
          {isDraft && (
            <span className="block mt-1 text-xs text-muted-foreground/80">
              Les modifications seront enregistrées automatiquement
            </span>
          )}
        </p>
      </div>
      {(form.id || hasTitle) ? (
        <FormSettings 
          ref={formSettingsRef}
          form={form as Form | DraftForm} 
          onUpdate={handleUpdate}
          hideSaveButton={isDraft}
          hidePublicationSection={true}
          onSaveFromParent={onSave}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-4">Ajoutez un titre à votre formulaire pour commencer la personnalisation.</p>
          <p className="text-xs">Les options de personnalisation seront disponibles après avoir ajouté un titre.</p>
        </div>
      )}
    </div>
  )
}
