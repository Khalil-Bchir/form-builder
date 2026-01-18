"use client"

import { useRouter } from "next/navigation"
import { FormSettings } from "./form-settings"
import type { Form } from "@/types/database.types"

interface FormCustomizationContentProps {
  form: Form
  isDraft?: boolean
  title?: string
  onSave?: () => Promise<void>
  isSaving?: boolean
}

export function FormCustomizationContent({ 
  form, 
  isDraft = false,
  title,
  onSave,
  isSaving = false
}: FormCustomizationContentProps) {
  const router = useRouter()

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
      {form.id || hasTitle ? (
        <FormSettings form={form} onUpdate={handleUpdate} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-4">Ajoutez un titre à votre formulaire pour commencer la personnalisation.</p>
          <p className="text-xs">Les options de personnalisation seront disponibles après avoir ajouté un titre.</p>
        </div>
      )}
    </div>
  )
}
