"use client"

import { useState, useEffect } from "react"
import { Calendar, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponseStats } from "./response-stats"
import { QuestionAnalytics } from "./question-analytics"
import { ResponseList } from "./response-list"
import type {
  ResponseStats as ResponseStatsType,
  QuestionAnalytics as QuestionAnalyticsType,
  FormResponse,
} from "../types/analytics"
import { format, subDays } from "date-fns"

interface AnalyticsDashboardProps {
  formId: string
  initialStats?: ResponseStatsType
  initialQuestionAnalytics?: QuestionAnalyticsType[]
  initialResponses?: FormResponse[]
}

export function AnalyticsDashboard({
  formId,
  initialStats,
  initialQuestionAnalytics,
  initialResponses,
}: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<ResponseStatsType | null>(
    initialStats || null
  )
  const [questionAnalytics, setQuestionAnalytics] = useState<
    QuestionAnalyticsType[]
  >(initialQuestionAnalytics || [])
  const [responses, setResponses] = useState<FormResponse[]>(
    initialResponses || []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("all")
  const [source, setSource] = useState<"all" | "qr" | "web">("all")

  useEffect(() => {
    loadAnalytics()
  }, [formId, dateRange, source])

  async function loadAnalytics() {
    setIsLoading(true)
    try {
      const startDate =
        dateRange === "all"
          ? undefined
          : subDays(new Date(), dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90)
      const endDate = dateRange === "all" ? undefined : new Date()
      const sourceFilter = source === "all" ? undefined : source

      const [statsRes, analyticsRes, responsesRes] = await Promise.all([
        fetch(
          `/api/forms/${formId}/analytics/stats?${new URLSearchParams({
            ...(startDate && { startDate: startDate.toISOString() }),
            ...(endDate && { endDate: endDate.toISOString() }),
            ...(sourceFilter && { source: sourceFilter }),
          })}`
        ),
        fetch(
          `/api/forms/${formId}/analytics/questions?${new URLSearchParams({
            ...(startDate && { startDate: startDate.toISOString() }),
            ...(endDate && { endDate: endDate.toISOString() }),
            ...(sourceFilter && { source: sourceFilter }),
          })}`
        ),
        fetch(
          `/api/forms/${formId}/analytics/responses?${new URLSearchParams({
            ...(startDate && { startDate: startDate.toISOString() }),
            ...(endDate && { endDate: endDate.toISOString() }),
            ...(sourceFilter && { source: sourceFilter }),
          })}`
        ),
      ])

      const [statsData, analyticsData, responsesData] = await Promise.all([
        statsRes.json(),
        analyticsRes.json(),
        responsesRes.json(),
      ])

      setStats(statsData)
      setQuestionAnalytics(analyticsData)
      setResponses(responsesData.data || [])
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and responses for your form
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={dateRange}
            onValueChange={(v: "7d" | "30d" | "90d" | "all") => setDateRange(v)}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={source}
            onValueChange={(v: "all" | "qr" | "web") => setSource(v)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="qr">QR Code</SelectItem>
              <SelectItem value="web">Web Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {stats && <ResponseStats stats={stats} />}
          {questionAnalytics.length > 0 && (
            <QuestionAnalytics analytics={questionAnalytics} />
          )}
          <ResponseList responses={responses} />
        </>
      )}
    </div>
  )
}
