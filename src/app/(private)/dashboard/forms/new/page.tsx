import { redirect } from "next/navigation"
import { FormBuilder } from "@/features/forms/components/form-builder"
import { createClient } from "@/lib/supabase/server"
import {
  createForm,
  createQuestion,
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
      required: boolean
      options?: string[]
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

    // Create questions
    for (const question of data.questions) {
      const { error: questionError } = await createQuestion(form.id, {
        order: question.order,
        type: question.type,
        text: question.text,
        required: question.required,
        options: question.options,
      })

      if (questionError) {
        throw new Error(questionError.message)
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <FormBuilder key="new-form" onSave={handleSave} />
    </div>
  )
}
