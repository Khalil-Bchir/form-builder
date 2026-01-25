import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { UnifiedFormEditor } from "@/features/forms/components/unified-form-editor"
import { createClient } from "@/lib/supabase/server"
import {
  createForm,
  createQuestion,
  createSection,
  getFormWithQuestions,
  getForm,
} from "@/features/forms/lib/form-queries"
import { generateSlug } from "@/features/forms/lib/form-utils"
import { revalidatePath } from "next/cache"

export default async function NewFormPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  async function handleSave(data: {
    formId?: string
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

    let form

    // If formId is provided, update existing form; otherwise create new one
    if (data.formId) {
      // Update existing form - don't recreate sections/questions
      const { data: updatedForm, error: updateError } = await supabase
        .from("forms")
        .update({
          title: data.title,
          description: data.description,
        })
        .eq("id", data.formId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError || !updatedForm) {
        throw new Error(updateError?.message || "Failed to update form")
      }
      // Skip creating sections/questions for existing forms - they're already created
      // Revalidate to refresh the page with updated data
      revalidatePath("/dashboard/forms/new")
      return
    }

    // Create new form
    const slug = generateSlug(data.title)
    const { data: createdForm, error: formError } = await createForm(user.id, {
      title: data.title,
      description: data.description,
      slug,
    })

    if (formError || !createdForm) {
      throw new Error(formError?.message || "Failed to create form")
    }
    form = createdForm

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

      // Clean up options - handle "$undefined" string, null, undefined, or invalid values
      let optionsValue: string[] | undefined = undefined
      if (question.options) {
        // Check if it's the string "$undefined" or similar invalid value
        if (typeof question.options === 'string') {
          // If it's a string, try to parse it (might be JSON)
          try {
            const parsed = JSON.parse(question.options)
            if (Array.isArray(parsed) && parsed.length > 0) {
              optionsValue = parsed
            }
          } catch {
            // If parsing fails and it's not "$undefined", ignore it
            if (question.options !== "$undefined" && question.options !== "undefined") {
              // Try to use it as a single option (shouldn't happen, but handle it)
              optionsValue = undefined
            }
          }
        } else if (Array.isArray(question.options) && question.options.length > 0) {
          // Valid array of options
          optionsValue = question.options
        }
      }

      // Only include options for choice-based questions
      if (question.type !== "single_choice" && question.type !== "multiple_choice") {
        optionsValue = undefined
      }

      const { error: questionError } = await createQuestion(form.id, {
        order: question.order,
        type: question.type,
        text: question.text,
        required: question.required ?? false,
        options: optionsValue,
        section_id: sectionId,
      })

      if (questionError) {
        throw new Error(questionError.message)
      }
    }

    // Store form ID in cookie so we can fetch it after refresh
    const cookieStore = await cookies()
    cookieStore.set("pending_form_id", form.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5, // 5 minutes - will expire automatically
    })

    // Revalidate the page to refresh with the new form data
    revalidatePath("/dashboard/forms/new")
  }

  // Check for pending form ID from cookie (set after Step 1 save)
  const cookieStore = await cookies()
  const pendingFormId = cookieStore.get("pending_form_id")?.value

  let existingForm = null
  let existingFormWithQuestions = null

  if (pendingFormId) {
    // Fetch the form that was just created
    const { data: formData } = await getForm(pendingFormId)
    const { data: formWithQuestionsData } = await getFormWithQuestions(pendingFormId)
    
    // Verify ownership
    if (formData && formData.user_id === user.id) {
      existingForm = formData
      existingFormWithQuestions = formWithQuestionsData
      // Cookie will expire automatically after 5 minutes - no need to delete manually
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 lg:p-8">
      <UnifiedFormEditor 
        key={existingForm?.id || "new-form"}
        formId={existingForm?.id}
        form={existingForm || undefined}
        initialTitle={existingFormWithQuestions?.title || ""}
        initialDescription={existingFormWithQuestions?.description || ""}
        initialQuestions={existingFormWithQuestions?.questions || []}
        initialSections={existingFormWithQuestions?.sections || []}
        onSave={handleSave} 
      />
    </div>
  )
}
