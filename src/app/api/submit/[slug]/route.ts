import { NextRequest, NextResponse } from "next/server"
import { createAnonymousClient } from "@/lib/supabase/server"
import type { FormSubmission } from "@/types/database.types"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body: FormSubmission = await request.json()

    // Use anonymous client for public form submissions (no authentication required)
    const supabase = createAnonymousClient()

    // Verify form exists and is published
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, status")
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    if (formError || !form) {
      console.error("Form lookup error:", formError)
      return NextResponse.json(
        { 
          error: "Formulaire introuvable ou non publié",
          details: formError?.message || "Erreur inconnue",
          code: formError?.code || "UNKNOWN"
        },
        { status: 404 }
      )
    }

    // Create response using SECURITY DEFINER function to bypass RLS issues
    const { data: responseData, error: responseError } = await supabase
      .rpc("create_public_form_response", {
        p_form_id: form.id,
        p_source: body.source,
      })

    if (responseError || !responseData) {
      console.error("Failed to create response:", responseError)
      return NextResponse.json(
        { 
          error: "Échec de la création de la réponse",
          details: responseError?.message || "Erreur inconnue",
          code: responseError?.code || "UNKNOWN"
        },
        { status: 500 }
      )
    }

    const responseId = responseData as string

    // Prepare answers as JSONB for the function
    const answersJson = body.answers.map((answer) => ({
      questionId: answer.questionId,
      answer: Array.isArray(answer.answer)
        ? JSON.stringify(answer.answer)
        : answer.answer,
    }))

    // Create answers using SECURITY DEFINER function
    const { error: answersError } = await supabase.rpc(
      "create_public_form_answers",
      {
        p_response_id: responseId,
        p_answers: answersJson as any,
      }
    )

    if (answersError) {
      console.error("Failed to save answers:", answersError)
      return NextResponse.json(
        { 
          error: "Échec de l'enregistrement des réponses",
          details: answersError?.message || "Erreur inconnue",
          code: answersError?.code || "UNKNOWN"
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erreur interne du serveur"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
