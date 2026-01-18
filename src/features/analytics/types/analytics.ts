import type { FormResponse as BaseFormResponse } from "@/types/database.types"

export interface ResponseStats {
  total: number
  qr: number
  web: number
}

export interface QuestionAnalytics {
  questionId: string
  questionText: string
  questionType: string
  totalResponses: number
  answerDistribution: Record<string, number>
  textResponses?: string[]
}

// Extended FormResponse with answers for analytics
export interface FormResponse extends BaseFormResponse {
  answers: Array<{
    questionId: string
    questionText: string
    answer: string
  }>
}
