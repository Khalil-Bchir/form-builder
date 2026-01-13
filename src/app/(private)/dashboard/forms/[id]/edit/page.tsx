import { redirect } from "next/navigation"
import { FormBuilder } from "@/features/forms/components/form-builder"
import { createClient } from "@/lib/supabase/server"
import {
  getFormWithQuestions,
  updateForm,
  deleteQuestion,
  createQuestion,
  updateQuestion,
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

    // Get existing questions
    const { data: existingForm } = await getFormWithQuestions(id)
    const existingQuestions = existingForm?.questions || []

    // Delete questions that are no longer present
    const newQuestionIds = new Set(
      data.questions
        .map((q) => q.text)
        .filter((text) =>
          existingQuestions.some((eq) => eq.text === text)
        )
    )

    for (const existingQuestion of existingQuestions) {
      if (!newQuestionIds.has(existingQuestion.text)) {
        await deleteQuestion(existingQuestion.id!)
      }
    }

    // Update or create questions
    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i]
      const existingQuestion = existingQuestions.find(
        (eq) => eq.text === question.text && eq.type === question.type
      )

      if (existingQuestion) {
        // Update existing question
        await updateQuestion(existingQuestion.id!, {
          order: question.order,
          type: question.type,
          text: question.text,
          required: question.required,
          options: question.options,
        })
      } else {
        // Create new question
        await createQuestion(id, {
          order: question.order,
          type: question.type,
          text: question.text,
          required: question.required,
          options: question.options,
        })
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <FormBuilder
        key={id}
        formId={id}
        initialTitle={form.title}
        initialDescription={form.description || ""}
        initialQuestions={form.questions}
        onSave={handleSave}
      />
    </div>
  )
}
