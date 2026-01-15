"use client"

import { useState, useEffect } from "react"
import { Calendar, Filter, TrendingUp, Users, QrCode, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ResponseStats } from "./response-stats"
import { QuestionAnalytics } from "./question-analytics"
import { ResponseList } from "./response-list"
import { ResponseTrends } from "./response-trends"
import type {
  ResponseStats as ResponseStatsType,
  QuestionAnalytics as QuestionAnalyticsType,
  FormResponse,
} from "../types/analytics"
import type { ResponseTrend } from "../lib/analytics-queries"
import { format, subDays } from "date-fns"

interface AnalyticsDashboardProps {
  formId: string
  formTitle: string
  formDescription?: string | null
  initialStats?: ResponseStatsType
  initialQuestionAnalytics?: QuestionAnalyticsType[]
  initialResponses?: FormResponse[]
  initialTrends?: ResponseTrend[]
}

export function AnalyticsDashboard({
  formId,
  formTitle,
  formDescription,
  initialStats,
  initialQuestionAnalytics,
  initialResponses,
  initialTrends,
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
  const [trends, setTrends] = useState<ResponseTrend[]>(initialTrends || [])
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

      const [statsRes, analyticsRes, responsesRes, trendsRes] = await Promise.all([
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
        fetch(
          `/api/forms/${formId}/analytics/trends?${new URLSearchParams({
            ...(startDate && { startDate: startDate.toISOString() }),
            ...(endDate && { endDate: endDate.toISOString() }),
            ...(sourceFilter && { source: sourceFilter }),
          })}`
        ),
      ])

      const [statsData, analyticsData, responsesData, trendsData] = await Promise.all([
        statsRes.json(),
        analyticsRes.json(),
        responsesRes.json(),
        trendsRes.json(),
      ])

      setStats(statsData)
      setQuestionAnalytics(analyticsData)
      setResponses(responsesData.data || [])
      setTrends(Array.isArray(trendsData) ? trendsData : [])
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate percentages for KPI cards
  const qrPercentage = stats && stats.total > 0 
    ? Math.round((stats.qr / stats.total) * 100) 
    : 0
  const webPercentage = stats && stats.total > 0 
    ? Math.round((stats.web / stats.total) * 100) 
    : 0

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{formTitle}</h1>
            {formDescription && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                {formDescription}
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">
              Analytics and insights for your form
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select
              value={dateRange}
              onValueChange={(v: "7d" | "30d" | "90d" | "all") => setDateRange(v)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
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
              <SelectTrigger className="w-full sm:w-[160px]">
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
        <Separator />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* KPI Cards Skeleton */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          {/* Charts Skeleton */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          {/* Content Skeleton */}
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          {/* KPI Cards Section */}
          {stats && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Responses
                  </CardTitle>
                  <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time submissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    QR Code Responses
                  </CardTitle>
                  <QrCode className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.qr}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {qrPercentage}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Web Link Responses
                  </CardTitle>
                  <LinkIcon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.web}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {webPercentage}% of total
                  </p>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Response Rate
                  </CardTitle>
                  <TrendingUp className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.total > 0 ? "100%" : "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completion rate
                  </p>
                </CardContent>
              </Card> */}
            </div>
          )}

          {/* Charts Section */}
          {stats && stats.total > 0 && (
            <div className="grid gap-4">
              {/* <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Source Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of responses by source
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponseStats stats={stats} showOnlyChart />
                </CardContent>
              </Card> */}

              <ResponseTrends trends={trends} chartType="area" />
            </div>
          )}

          {/* Questions and Responses Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Question Analytics - Takes 2 columns on desktop */}
            <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
              {questionAnalytics.length > 0 ? (
                <QuestionAnalytics analytics={questionAnalytics} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Question Analytics</CardTitle>
                    <CardDescription>
                      Insights for each question in your form
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-sm">No question data available</p>
                      <p className="text-xs mt-1">
                        Analytics will appear once you receive responses
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Responses - Takes 1 column on desktop */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <ResponseList responses={responses} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
