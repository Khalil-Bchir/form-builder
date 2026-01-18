import { redirect } from "next/navigation"
import { UnifiedFormEditor } from "@/features/forms/components/unified-form-editor"
import { createClient } from "@/lib/supabase/server"
import {
  createForm,
  createQuestion,
  createSection,
} from "@/features/forms/lib/form-queries"
import { generateSlug } from "@/features/forms/lib/form-utils"

export default async function NewFormPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  async function handleSave(data: {
    title: string
    description?: string
    questions: Array<{
      order: number
      type: string
      text: string
      required: boolean | null
      options?: string[] | null
      section_id?: string | null
    }>
    sections: Array<{
      title: string
      description?: string | null
      order: number
    }>
  }): Promise<void> {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Create form
    const slug = generateSlug(data.title)
    const { data: form, error: formError } = await createForm(user.id, {
      title: data.title,
      description: data.description,
      slug,
    })

    if (formError || !form) {
      throw new Error(formError?.message || "Failed to create form")
    }

    // Create sections first and build a mapping from temporary IDs to real IDs
    const sectionIdMap: Record<string, string> = {}
    for (const section of data.sections) {
      const { data: createdSection, error: sectionError } = await createSection(form.id, {
        title: section.title,
        description: section.description ?? null,
        order: section.order,
      })

      if (sectionError || !createdSection) {
        throw new Error(sectionError?.message || "Failed to create section")
      }
      // Map temporary order-based ID to real section ID
      sectionIdMap[`order-${section.order}`] = createdSection.id
    }

    // Create questions with section references
    for (const question of data.questions) {
      // Resolve section_id: convert temporary order-based ID to real section ID
      let sectionId: string | null = null
      if (question.section_id) {
        if (question.section_id.startsWith("order-")) {
          // It's a temporary order-based ID, look it up
          sectionId = sectionIdMap[question.section_id] || null
        } else {
          // It's already a real section ID (shouldn't happen for new forms, but handle it)
          sectionId = question.section_id
        }
      }

      const { error: questionError } = await createQuestion(form.id, {
        order: question.order,
        type: question.type,
        text: question.text,
        required: question.required ?? false,
        options: question.options ?? undefined,
        section_id: sectionId,
      })

      if (questionError) {
        throw new Error(questionError.message)
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 lg:p-8">
      <UnifiedFormEditor key="new-form" onSave={handleSave} />
    </div>
  )
}
