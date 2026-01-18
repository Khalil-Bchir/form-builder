import { createClient, createAnonymousClient } from "@/lib/supabase/server"
import type { FormWithQuestions, FormQuestionWithOptions } from "@/types/database.types"

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

  const { data: sections, error: sectionsError } = await supabase
    .from("form_sections")
    .select("*")
    .eq("form_id", formId)
    .order("order", { ascending: true })

  if (sectionsError) {
    return { data: null, error: sectionsError }
  }

  // Parse JSON options for questions
  const parsedQuestions: FormQuestionWithOptions[] = (questions || []).map((q) => ({
    ...q,
    options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
  }))

  return {
    data: {
      ...form,
      questions: parsedQuestions,
      sections: sections || [],
    },
    error: null,
  }
}

export async function getFormWithQuestionsBySlug(slug: string): Promise<{
  data: FormWithQuestions | null
  error: { message: string } | null
}> {
  // Use anonymous client for public form access (no authentication required)
  const supabase = createAnonymousClient()
  
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

  const { data: sections, error: sectionsError } = await supabase
    .from("form_sections")
    .select("*")
    .eq("form_id", form.id)
    .order("order", { ascending: true })

  if (sectionsError) {
    return { data: null, error: sectionsError }
  }

  // Parse JSON options for questions
  const parsedQuestions: FormQuestionWithOptions[] = (questions || []).map((q) => ({
    ...q,
    options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
  }))

  return {
    data: {
      ...form,
      questions: parsedQuestions,
      sections: sections || [],
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
    required: boolean | null
    options?: string[]
    section_id?: string | null
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
    required?: boolean | null
    options?: string[]
    section_id?: string | null
  }
) {
  const supabase = await createClient()
  const { options, ...restData } = questionData
  const updateData: {
    order?: number
    type?: string
    text?: string
    required?: boolean | null
    options?: string | null
    section_id?: string | null
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

// Section CRUD operations
export async function createSection(
  formId: string,
  sectionData: {
    title: string
    description?: string | null
    order: number
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("form_sections")
    .insert({
      form_id: formId,
      ...sectionData,
      description: sectionData.description ?? null,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateSection(
  sectionId: string,
  sectionData: {
    title?: string
    description?: string | null
    order?: number
  }
) {
  const supabase = await createClient()
  const updateData: {
    title?: string
    description?: string | null
    order?: number
  } = { ...sectionData }
  if ('description' in sectionData) {
    updateData.description = sectionData.description ?? null
  }
  const { data, error } = await supabase
    .from("form_sections")
    .update(updateData)
    .eq("id", sectionId)
    .select()
    .single()

  return { data, error }
}

export async function deleteSection(sectionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("form_sections")
    .delete()
    .eq("id", sectionId)

  return { error }
}

export async function getSections(formId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("form_sections")
    .select("*")
    .eq("form_id", formId)
    .order("order", { ascending: true })

  return { data, error }
}
