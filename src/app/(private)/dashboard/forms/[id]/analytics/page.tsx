import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard"
import { createClient } from "@/lib/supabase/server"
import { getForm } from "@/features/forms/lib/form-queries"
import {
  getResponseStats,
  getQuestionAnalytics,
  getFormResponses,
  getResponseTrends,
} from "@/features/analytics/lib/analytics-queries"

interface AnalyticsPageProps {
  params: Promise<{ id: string }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: form, error } = await getForm(id)

  if (error || !form) {
    redirect("/dashboard/forms")
  }

  // Check ownership
  if (form.user_id !== user.id) {
    redirect("/dashboard/forms")
  }

  // Load initial analytics data
  const [stats, questionAnalytics, responsesData, trends] = await Promise.all([
    getResponseStats(id),
    getQuestionAnalytics(id),
    getFormResponses(id, undefined, undefined, undefined, 50, 0),
    getResponseTrends(id),
  ])

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <AnalyticsDashboard
        formId={id}
        formTitle={form.title}
        formDescription={form.description}
        initialStats={stats}
        initialQuestionAnalytics={questionAnalytics}
        initialResponses={responsesData.data}
        initialTrends={trends}
      />
    </div>
  )
}
