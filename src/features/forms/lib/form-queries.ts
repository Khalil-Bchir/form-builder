import { createClient } from "@/lib/supabase/server"
import type { Form, FormQuestion, FormWithQuestions } from "../types/form"

export async function getForms(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data, error }
}

export async function getForm(formId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .single()

  return { data, error }
}

export async function getFormBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  return { data, error }
}

export async function getFormWithQuestions(formId: string): Promise<{
  data: FormWithQuestions | null
  error: { message: string } | null
}> {
  const supabase = await createClient()
  
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .single()

  if (formError || !form) {
    return { data: null, error: formError }
  }

  const { data: questions, error: questionsError } = await supabase
    .from("form_questions")
    .select("*")
    .eq("form_id", formId)
    .order("order", { ascending: true })

  if (questionsError) {
    return { data: null, error: questionsError }
  }

  // Parse JSON options for questions
  const parsedQuestions = (questions || []).map((q) => ({
    ...q,
    options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
  }))

  return {
    data: {
      ...form,
      questions: parsedQuestions,
    },
    error: null,
  }
}

export async function getFormWithQuestionsBySlug(slug: string): Promise<{
  data: FormWithQuestions | null
  error: { message: string } | null
}> {
  const supabase = await createClient()
  
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (formError || !form) {
    return { data: null, error: formError }
  }

  const { data: questions, error: questionsError } = await supabase
    .from("form_questions")
    .select("*")
    .eq("form_id", form.id)
    .order("order", { ascending: true })

  if (questionsError) {
    return { data: null, error: questionsError }
  }

  // Parse JSON options for questions
  const parsedQuestions = (questions || []).map((q) => ({
    ...q,
    options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
  }))

  return {
    data: {
      ...form,
      questions: parsedQuestions,
    },
    error: null,
  }
}

export async function createForm(
  userId: string,
  formData: {
    title: string
    description?: string
    slug: string
    color?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("forms")
    .insert({
      user_id: userId,
      ...formData,
      status: "draft",
    })
    .select()
    .single()

  return { data, error }
}

export async function updateForm(
  formId: string,
  formData: {
    title?: string
    description?: string
    slug?: string
    status?: "draft" | "published"
    color?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("forms")
    .update(formData)
    .eq("id", formId)
    .select()
    .single()

  return { data, error }
}

export async function deleteForm(formId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("forms").delete().eq("id", formId)

  return { error }
}

export async function createQuestion(
  formId: string,
  questionData: {
    order: number
    type: string
    text: string
    required: boolean
    options?: string[]
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("form_questions")
    .insert({
      form_id: formId,
      ...questionData,
      options: questionData.options ? JSON.stringify(questionData.options) : null,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateQuestion(
  questionId: string,
  questionData: {
    order?: number
    type?: string
    text?: string
    required?: boolean
    options?: string[]
  }
) {
  const supabase = await createClient()
  const { options, ...restData } = questionData
  const updateData: {
    order?: number
    type?: string
    text?: string
    required?: boolean
    options?: string | null
  } = { ...restData }
  if (options) {
    updateData.options = JSON.stringify(options)
  } else {
    updateData.options = null
  }

  const { data, error } = await supabase
    .from("form_questions")
    .update(updateData)
    .eq("id", questionId)
    .select()
    .single()

  return { data, error }
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("form_questions")
    .delete()
    .eq("id", questionId)

  return { error }
}

export async function getQuestions(formId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("form_questions")
    .select("*")
    .eq("form_id", formId)
    .order("order", { ascending: true })

  // Parse JSON options for questions
  const parsedData = (data || []).map((q) => ({
    ...q,
    options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
  }))

  return { data: parsedData, error }
}
