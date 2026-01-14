export type QuestionType = "single_choice" | "multiple_choice" | "short_text" | "long_text"

export type FormStatus = "draft" | "published"

export interface FormQuestion {
  id?: string
  form_id?: string
  order: number
  type: QuestionType
  text: string
  required: boolean
  options?: string[]
  created_at?: string
}

export type FormTheme = "light" | "dark" | "auto"
export type FormLayout = "centered" | "wide" | "full"
export type FormFontFamily = "inter" | "roboto" | "open-sans" | "lato" | "montserrat" | "poppins"
export type ButtonStyle = "default" | "rounded" | "pill" | "outline"

export interface Form {
  id: string
  user_id: string
  title: string
  description?: string
  slug: string
  status: FormStatus
  color: string
  theme?: FormTheme
  layout?: FormLayout
  font_family?: FormFontFamily
  background_color?: string
  button_style?: ButtonStyle
  button_color?: string
  show_progress?: boolean
  // Branding and Contact
  company_name?: string
  company_logo_url?: string
  contact_email?: string
  contact_phone?: string
  website_url?: string
  show_branding?: boolean
  created_at: string
  updated_at: string
}

export interface FormResponse {
  id: string
  form_id: string
  source: "qr" | "web"
  created_at: string
}

export interface FormAnswer {
  id: string
  response_id: string
  question_id: string
  answer: string
  created_at: string
}

export interface FormWithQuestions extends Form {
  questions: FormQuestion[]
}

export interface FormSubmission {
  formId: string
  answers: Array<{
    questionId: string
    answer: string | string[]
  }>
  source: "qr" | "web"
}
