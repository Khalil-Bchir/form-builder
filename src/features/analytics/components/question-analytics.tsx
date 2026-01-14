"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { QuestionAnalytics as QuestionAnalyticsType } from "../types/analytics"
import { getQuestionTypeEmoji } from "@/features/forms/lib/form-utils"

interface QuestionAnalyticsProps {
  analytics: QuestionAnalyticsType[]
}

export function QuestionAnalytics({ analytics }: QuestionAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Question Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed insights for each question in your form
        </p>
      </div>
      {analytics.map((question) => (
        <Card key={question.questionId}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span>{getQuestionTypeEmoji(question.questionType)}</span>
              <span className="line-clamp-2">{question.questionText}</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {question.totalResponses} {question.totalResponses === 1 ? "response" : "responses"}
            </div>
          </CardHeader>
          <CardContent>
            {question.questionType === "single_choice" ||
            question.questionType === "multiple_choice" ? (
              <div>
                {Object.keys(question.answerDistribution).length > 0 ? (
                  (() => {
                    const chartData = Object.entries(question.answerDistribution)
                      .map(([key, value]) => ({ answer: key, responses: value }))
                      .sort((a, b) => b.responses - a.responses)
                      .slice(0, 10) // Limit to top 10 for readability

                    const chartConfig = {
                      responses: {
                        label: "Responses",
                        color: "var(--chart-4)",
                      },
                    }

                    return (
                      <ChartContainer config={chartConfig} className="h-[280px] w-full">
                        <BarChart data={chartData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="answer"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => 
                              value.length > 15 ? `${value.slice(0, 15)}...` : value
                            }
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            className="text-xs"
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-xs"
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                          />
                          <Bar
                            dataKey="responses"
                            fill="var(--color-responses)"
                            radius={[4, 4, 0, 0]}
                            label={({ value, x, y, width, height }) => {
                              if (value === 0) {
                                return <g />
                              }
                              return (
                                <text
                                  x={(x || 0) + (width || 0) / 2}
                                  y={(y || 0) - 5}
                                  fill="currentColor"
                                  textAnchor="middle"
                                  fontSize={12}
                                  className="fill-foreground"
                                >
                                  {value}
                                </text>
                              )
                            }}
                          />
                        </BarChart>
                      </ChartContainer>
                    )
                  })()
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No responses yet</p>
                    <p className="text-xs mt-1">Answers will appear here once received</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {question.textResponses && question.textResponses.length > 0 ? (
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-3 pr-4">
                      {question.textResponses.map((response, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-sm leading-relaxed">{response}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No responses yet</p>
                    <p className="text-xs mt-1">Text responses will appear here once received</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
