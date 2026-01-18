import { redirect } from "next/navigation"
import { UnifiedFormEditor } from "@/features/forms/components/unified-form-editor"
import { createClient } from "@/lib/supabase/server"
import {
  getFormWithQuestions,
  getForm,
  updateForm,
  deleteQuestion,
  createQuestion,
  updateQuestion,
  createSection,
  updateSection,
  deleteSection,
} from "@/features/forms/lib/form-queries"
import { generateSlug } from "@/features/forms/lib/form-utils"

interface EditFormPageProps {
  params: Promise<{ id: string }>
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: form, error } = await getFormWithQuestions(id)

  if (error || !form) {
    redirect("/dashboard/forms")
  }

  // Check ownership
  if (form.user_id !== user.id) {
    redirect("/dashboard/forms")
  }

  // Get full form data for settings
  const { data: fullForm } = await getForm(id)

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
  }) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update form
    const slug = generateSlug(data.title)
    const { error: formError } = await updateForm(id, {
      title: data.title,
      description: data.description,
      slug,
    })

    if (formError) {
      throw new Error(formError.message)
    }

    // Get existing form data
    const { data: existingForm } = await getFormWithQuestions(id)
    const existingQuestions = existingForm?.questions || []
    const existingSections = existingForm?.sections || []

    // Handle sections: create, update, or delete
    const sectionIdMap: Record<string, string> = {} // Maps temporary/old IDs to real IDs
    
    // Process sections in order
    for (const section of data.sections) {
      // Try to find existing section by title (best match) or by order
      let existingSection = existingSections.find(
        (es) => es.title === section.title
      )
      
      // If not found by title, try to match by order (for reordered sections)
      if (!existingSection && section.order < existingSections.length) {
        existingSection = existingSections[section.order]
      }

      if (existingSection) {
        // Update existing section
        await updateSection(existingSection.id!, {
          title: section.title,
          description: section.description ?? null,
          order: section.order,
        })
        // Map both the real ID and temporary order-based ID to the real ID
        sectionIdMap[existingSection.id!] = existingSection.id!
        sectionIdMap[`order-${section.order}`] = existingSection.id!
      } else {
        // Create new section
        const { data: newSection, error: sectionError } = await createSection(id, {
          title: section.title,
          description: section.description ?? null,
          order: section.order,
        })
        if (sectionError || !newSection) {
          throw new Error(sectionError?.message || "Failed to create section")
        }
        // Map temporary order-based ID to real section ID
        sectionIdMap[`order-${section.order}`] = newSection.id
      }
    }

    // Delete sections that are no longer present
    const newSectionTitles = new Set(data.sections.map((s) => s.title))
    for (const existingSection of existingSections) {
      if (!newSectionTitles.has(existingSection.title)) {
        await deleteSection(existingSection.id!)
      }
    }

    // Delete questions that are no longer present
    const newQuestionTexts = new Set(data.questions.map((q) => q.text))
    for (const existingQuestion of existingQuestions) {
      if (!newQuestionTexts.has(existingQuestion.text)) {
        await deleteQuestion(existingQuestion.id!)
      }
    }

    // Update or create questions
    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i]
      const existingQuestion = existingQuestions.find(
        (eq) => eq.text === question.text && eq.type === question.type
      )

      // Resolve section_id: convert temporary order-based ID to real section ID
      let sectionId: string | null = null
      if (question.section_id) {
        if (question.section_id.startsWith("order-")) {
          // It's a temporary order-based ID, look it up
          sectionId = sectionIdMap[question.section_id] || null
        } else if (question.section_id in sectionIdMap) {
          // It's already mapped
          sectionId = sectionIdMap[question.section_id]
        } else {
          // It's a real section ID that should still exist
          const matchingSection = existingSections.find(
            (es) => es.id === question.section_id
          )
          if (matchingSection) {
            sectionId = matchingSection.id!
          }
        }
      }

      if (existingQuestion) {
        // Update existing question
        await updateQuestion(existingQuestion.id!, {
          order: question.order,
          type: question.type,
          text: question.text,
          required: question.required,
          options: question.options ?? undefined,
          section_id: sectionId,
        })
      } else {
        // Create new question
        await createQuestion(id, {
          order: question.order,
          type: question.type,
          text: question.text,
          required: question.required,
          options: question.options ?? undefined,
          section_id: sectionId,
        })
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 lg:p-8">
      <UnifiedFormEditor
        key={id}
        formId={id}
        form={fullForm || undefined}
        initialTitle={form.title}
        initialDescription={form.description || ""}
        initialQuestions={form.questions}
        initialSections={form.sections || []}
        onSave={handleSave}
      />
    </div>
  )
}
