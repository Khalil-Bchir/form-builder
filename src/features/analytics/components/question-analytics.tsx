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
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="mb-3 sm:mb-4 w-full min-w-0">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold">Analyses par question</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Insights détaillés pour chaque question de votre formulaire
        </p>
      </div>
      {analytics.map((question) => (
        <Card key={question.questionId} className="min-w-0 max-w-full overflow-x-hidden">
          <CardHeader className="px-3 sm:px-4 md:px-6">
            <CardTitle className="text-xs sm:text-sm lg:text-base flex items-center gap-2 flex-wrap">
              <span className="flex-shrink-0">{getQuestionTypeEmoji(question.questionType)}</span>
              <span className="line-clamp-2 break-words">{question.questionText}</span>
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {question.totalResponses} {question.totalResponses === 1 ? "réponse" : "réponses"}
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6">
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
                        label: "Réponses",
                        color: "var(--chart-4)",
                      },
                    }

                    return (
                      <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[280px] w-full min-w-0 max-w-full overflow-x-hidden">
                        <BarChart data={chartData} margin={{ left: -10, right: 8, top: 8, bottom: 60 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="answer"
                            tickLine={false}
                            tickMargin={8}
                            axisLine={false}
                            tickFormatter={(value) => 
                              value.length > 12 ? `${value.slice(0, 12)}...` : value
                            }
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            className="text-[9px] sm:text-[10px] lg:text-xs"
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            className="text-[10px] sm:text-xs"
                            width={25}
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                          />
                          <Bar
                            dataKey="responses"
                            fill="var(--color-responses)"
                            radius={[4, 4, 0, 0]}
                            label={({ value, x, y, width, height }) => {
                              if (value === 0 || (width || 0) < 20) {
                                return <g />
                              }
                              return (
                                <text
                                  x={(x || 0) + (width || 0) / 2}
                                  y={(y || 0) - 5}
                                  fill="currentColor"
                                  textAnchor="middle"
                                  fontSize={10}
                                  className="fill-foreground sm:text-xs"
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
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <p className="text-xs sm:text-sm">Aucune réponse pour le moment</p>
                    <p className="text-xs mt-1">Les réponses apparaîtront ici une fois reçues</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {question.textResponses && question.textResponses.length > 0 ? (
                  <ScrollArea className="h-[200px] sm:h-[250px] lg:h-[280px]">
                    <div className="space-y-2 sm:space-y-3 pr-3 sm:pr-4 md:pr-6">
                      {question.textResponses.map((response, index) => (
                        <div
                          key={index}
                          className="p-2.5 sm:p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-xs sm:text-sm leading-relaxed break-words">{response}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <p className="text-xs sm:text-sm">Aucune réponse pour le moment</p>
                    <p className="text-xs mt-1">Les réponses texte apparaîtront ici une fois reçues</p>
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
