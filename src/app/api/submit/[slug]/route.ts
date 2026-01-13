import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { FormSubmission } from "@/features/forms/types/form"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body: FormSubmission = await request.json()

    const supabase = await createClient()

    // Verify form exists and is published
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, status")
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    if (formError || !form) {
      return NextResponse.json(
        { error: "Form not found or not published" },
        { status: 404 }
      )
    }

    // Create response
    const { data: response, error: responseError } = await supabase
      .from("form_responses")
      .insert({
        form_id: form.id,
        source: body.source,
      })
      .select()
      .single()

    if (responseError || !response) {
      return NextResponse.json(
        { error: "Failed to create response" },
        { status: 500 }
      )
    }

    // Create answers
    const answers = body.answers.map((answer) => ({
      response_id: response.id,
      question_id: answer.questionId,
      answer: Array.isArray(answer.answer)
        ? JSON.stringify(answer.answer)
        : answer.answer,
    }))

    const { error: answersError } = await supabase
      .from("form_answers")
      .insert(answers)

    if (answersError) {
      return NextResponse.json(
        { error: "Failed to save answers" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
