import { createClient } from "@/lib/supabase/server"
import type {
  ResponseStats,
  QuestionAnalytics,
  FormResponse,
} from "../types/analytics"

export async function getResponseStats(
  formId: string,
  startDate?: Date,
  endDate?: Date,
  source?: "qr" | "web"
): Promise<ResponseStats> {
  const supabase = await createClient()

  let query = supabase
    .from("form_responses")
    .select("source", { count: "exact" })
    .eq("form_id", formId)

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString())
  }

  if (endDate) {
    query = query.lte("created_at", endDate.toISOString())
  }

  if (source) {
    query = query.eq("source", source)
  }

  const { count, error } = await query

  if (error) {
    return { total: 0, qr: 0, web: 0 }
  }

  // Get breakdown by source
  const { data: qrData } = await supabase
    .from("form_responses")
    .select("id", { count: "exact" })
    .eq("form_id", formId)
    .eq("source", "qr")

  const { data: webData } = await supabase
    .from("form_responses")
    .select("id", { count: "exact" })
    .eq("form_id", formId)
    .eq("source", "web")

  return {
    total: count || 0,
    qr: qrData?.length || 0,
    web: webData?.length || 0,
  }
}

export async function getQuestionAnalytics(
  formId: string,
  startDate?: Date,
  endDate?: Date,
  source?: "qr" | "web"
): Promise<QuestionAnalytics[]> {
  const supabase = await createClient()

  // Get all questions for the form
  const { data: questions } = await supabase
    .from("form_questions")
    .select("*")
    .eq("form_id", formId)
    .order("order", { ascending: true })

  if (!questions) return []

  // Get all responses with filters
  let responseQuery = supabase
    .from("form_responses")
    .select("id, created_at, source")
    .eq("form_id", formId)

  if (startDate) {
    responseQuery = responseQuery.gte("created_at", startDate.toISOString())
  }

  if (endDate) {
    responseQuery = responseQuery.lte("created_at", endDate.toISOString())
  }

  if (source) {
    responseQuery = responseQuery.eq("source", source)
  }

  const { data: responses } = await responseQuery

  if (!responses || responses.length === 0) {
    return questions.map((q) => ({
      questionId: q.id,
      questionText: q.text,
      questionType: q.type,
      totalResponses: 0,
      answerDistribution: {},
      textResponses: [],
    }))
  }

  const responseIds = responses.map((r) => r.id)

  // Get all answers for these responses
  const { data: answers } = await supabase
    .from("form_answers")
    .select("*")
    .in("response_id", responseIds)

  // Process analytics for each question
  const analytics: QuestionAnalytics[] = questions.map((question) => {
    const questionAnswers = answers?.filter(
      (a) => a.question_id === question.id
    ) || []

    if (question.type === "single_choice" || question.type === "multiple_choice") {
      const distribution: Record<string, number> = {}
      
      questionAnswers.forEach((answer) => {
        try {
          const answerValue = JSON.parse(answer.answer)
          const values = Array.isArray(answerValue) ? answerValue : [answerValue]
          
          values.forEach((value: string) => {
            distribution[value] = (distribution[value] || 0) + 1
          })
        } catch {
          // If not JSON, treat as string
          distribution[answer.answer] = (distribution[answer.answer] || 0) + 1
        }
      })

      return {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        totalResponses: questionAnswers.length,
        answerDistribution: distribution,
      }
    } else {
      // Text responses
      const textResponses = questionAnswers.map((a) => {
        try {
          return JSON.parse(a.answer)
        } catch {
          return a.answer
        }
      })

      return {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        totalResponses: questionAnswers.length,
        answerDistribution: {},
        textResponses,
      }
    }
  })

  return analytics
}

export async function getFormResponses(
  formId: string,
  startDate?: Date,
  endDate?: Date,
  source?: "qr" | "web",
  limit = 50,
  offset = 0
): Promise<{ data: FormResponse[]; total: number }> {
  const supabase = await createClient()

  let responseQuery = supabase
    .from("form_responses")
    .select("id, created_at, source")
    .eq("form_id", formId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (startDate) {
    responseQuery = responseQuery.gte("created_at", startDate.toISOString())
  }

  if (endDate) {
    responseQuery = responseQuery.lte("created_at", endDate.toISOString())
  }

  if (source) {
    responseQuery = responseQuery.eq("source", source)
  }

  const { data: responses, count } = await responseQuery

  if (!responses || responses.length === 0) {
    return { data: [], total: 0 }
  }

  const responseIds = responses.map((r) => r.id)

  // Get all answers
  const { data: answers } = await supabase
    .from("form_answers")
    .select("*, form_questions!inner(text)")
    .in("response_id", responseIds)

  // Get questions for mapping
  const { data: questions } = await supabase
    .from("form_questions")
    .select("id, text")
    .eq("form_id", formId)

  const questionMap = new Map(questions?.map((q) => [q.id, q.text]) || [])

  // Group answers by response
  const responseMap = new Map<string, FormResponse>()

  responses.forEach((response) => {
    responseMap.set(response.id, {
      id: response.id,
      created_at: response.created_at,
      source: response.source,
      answers: [],
    })
  })

  interface AnswerRow {
    response_id: string
    question_id: string
    answer: string
    form_questions?: {
      text: string
    }
  }

  answers?.forEach((answer: AnswerRow) => {
    const response = responseMap.get(answer.response_id)
    if (response) {
      let answerValue: string | string[] = answer.answer
      try {
        const parsed = JSON.parse(answer.answer)
        answerValue = Array.isArray(parsed) ? parsed : parsed
      } catch {
        // Keep as string
      }

      response.answers.push({
        questionId: answer.question_id,
        questionText: questionMap.get(answer.question_id) || "Unknown",
        answer: Array.isArray(answerValue)
          ? answerValue.join(", ")
          : String(answerValue),
      })
    }
  })

  return {
    data: Array.from(responseMap.values()),
    total: count || 0,
  }
}
