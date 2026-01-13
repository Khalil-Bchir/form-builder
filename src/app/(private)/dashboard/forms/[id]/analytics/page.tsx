import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard"
import { createClient } from "@/lib/supabase/server"
import { getForm } from "@/features/forms/lib/form-queries"
import {
  getResponseStats,
  getQuestionAnalytics,
  getFormResponses,
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
  const [stats, questionAnalytics, responsesData] = await Promise.all([
    getResponseStats(id),
    getQuestionAnalytics(id),
    getFormResponses(id, undefined, undefined, undefined, 50, 0),
  ])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <AnalyticsDashboard
        formId={id}
        initialStats={stats}
        initialQuestionAnalytics={questionAnalytics}
        initialResponses={responsesData.data}
      />
    </div>
  )
}
