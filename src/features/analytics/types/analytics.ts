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

export interface FormResponse {
  id: string
  created_at: string
  source: "qr" | "web"
  answers: Array<{
    questionId: string
    questionText: string
    answer: string
  }>
}
