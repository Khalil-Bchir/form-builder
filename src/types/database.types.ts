export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      form_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          question_id: string
          response_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question_id: string
          response_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "form_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "form_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      form_questions: {
        Row: {
          created_at: string
          form_id: string
          id: string
          options: Json | null
          order: number
          required: boolean | null
          section_id: string | null
          text: string
          type: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          options?: Json | null
          order?: number
          required?: boolean | null
          section_id?: string | null
          text: string
          type: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          options?: Json | null
          order?: number
          required?: boolean | null
          section_id?: string | null
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "form_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          created_at: string
          form_id: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          source: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_sections: {
        Row: {
          created_at: string | null
          description: string | null
          form_id: string
          id: string
          order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          form_id: string
          id?: string
          order?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          form_id?: string
          id?: string
          order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_sections_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          background_color: string | null
          button_color: string | null
          button_style: string | null
          color: string | null
          company_logo_url: string | null
          company_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          font_family: string | null
          id: string
          layout: string | null
          show_branding: boolean | null
          show_progress: boolean | null
          slug: string
          status: string
          theme: string | null
          title: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          background_color?: string | null
          button_color?: string | null
          button_style?: string | null
          color?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          font_family?: string | null
          id?: string
          layout?: string | null
          show_branding?: boolean | null
          show_progress?: boolean | null
          slug: string
          status?: string
          theme?: string | null
          title: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          background_color?: string | null
          button_color?: string | null
          button_style?: string | null
          color?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          font_family?: string | null
          id?: string
          layout?: string | null
          show_branding?: boolean | null
          show_progress?: boolean | null
          slug?: string
          status?: string
          theme?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_public_form_answers: {
        Args: { p_answers: Json; p_response_id: string }
        Returns: undefined
      }
      create_public_form_response: {
        Args: { p_form_id: string; p_source: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ============================================================================
// Convenience Type Aliases - Use these throughout the app
// ============================================================================

// Base table types
export type Form = Tables<"forms">
export type FormInsert = TablesInsert<"forms">
export type FormUpdate = TablesUpdate<"forms">

export type FormQuestion = Tables<"form_questions">
export type FormQuestionInsert = TablesInsert<"form_questions">
export type FormQuestionUpdate = TablesUpdate<"form_questions">

export type FormSection = Tables<"form_sections">
export type FormSectionInsert = TablesInsert<"form_sections">
export type FormSectionUpdate = TablesUpdate<"form_sections">

export type FormResponse = Tables<"form_responses">
export type FormResponseInsert = TablesInsert<"form_responses">
export type FormResponseUpdate = TablesUpdate<"form_responses">

export type FormAnswer = Tables<"form_answers">
export type FormAnswerInsert = TablesInsert<"form_answers">
export type FormAnswerUpdate = TablesUpdate<"form_answers">

export type Profile = Tables<"profiles">
export type ProfileInsert = TablesInsert<"profiles">
export type ProfileUpdate = TablesUpdate<"profiles">

// Extended types with parsed options
export type FormQuestionWithOptions = Omit<FormQuestion, "options"> & {
  options?: string[] | null
}

// Combined types for common use cases
export type FormWithQuestions = Form & {
  questions: FormQuestionWithOptions[]
  sections?: FormSection[]
}

// Enum/Union types (matching database constraints)
export type QuestionType = "single_choice" | "multiple_choice" | "short_text" | "long_text" | "rating"
export type FormStatus = "draft" | "published"
export type FormTheme = "light" | "dark" | "auto"
export type FormLayout = "centered" | "wide" | "full"
export type FormFontFamily = "inter" | "roboto" | "open-sans" | "lato" | "montserrat" | "poppins"
export type ButtonStyle = "default" | "rounded" | "pill" | "outline"
export type FormSource = "qr" | "web"

// Submission types (for API)
export interface FormSubmission {
  formId: string
  answers: Array<{
    questionId: string
    answer: string | string[]
  }>
  source: FormSource
}
