"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ResponseTrend } from "../lib/analytics-queries"
import { format, parseISO } from "date-fns"

interface ResponseTrendsProps {
  trends: ResponseTrend[]
  chartType?: "area" | "line"
}

const chartConfig = {
  qr: {
    label: "QR Code",
    color: "var(--chart-1)",
  },
  web: {
    label: "Web Link",
    color: "var(--chart-4)",
  },
  total: {
    label: "Total",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ResponseTrends({ trends, chartType }: ResponseTrendsProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("total")

  const total = React.useMemo(
    () => ({
      qr: trends.reduce((acc, curr) => acc + curr.qr, 0),
      web: trends.reduce((acc, curr) => acc + curr.web, 0),
      total: trends.reduce((acc, curr) => acc + curr.total, 0),
    }),
    [trends]
  )

  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Response Trends</CardTitle>
          <CardDescription>Submissions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No data available</p>
              <p className="text-xs mt-1">Trends will appear once you receive responses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format dates for display - keep ISO format for chart, add formatted date for display
  const chartData = trends.map((trend) => ({
    ...trend,
    date: trend.date, // Keep ISO format for proper date handling
  }))

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-4 sm:px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle className="text-sm sm:text-base font-semibold">Response Trends</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Submissions over time</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row">
          {(["qr", "web", "total"] as const).map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-4 sm:px-6 py-3 sm:py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 transition-colors hover:bg-muted/30"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-base sm:text-lg lg:text-3xl leading-none font-bold">
                  {total[key].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] sm:h-[250px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              className="text-xs"
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Area
              dataKey={activeChart}
              type="monotone"
              fill={`var(--color-${activeChart})`}
              fillOpacity={0.4}
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
