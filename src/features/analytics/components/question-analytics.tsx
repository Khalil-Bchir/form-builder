"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { QuestionAnalytics as QuestionAnalyticsType } from "../types/analytics"
import { getQuestionTypeEmoji } from "@/features/forms/lib/form-utils"

interface QuestionAnalyticsProps {
  analytics: QuestionAnalyticsType[]
}

export function QuestionAnalytics({ analytics }: QuestionAnalyticsProps) {
  return (
    <div className="space-y-4">
      {analytics.map((question) => (
        <Card key={question.questionId}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span>{getQuestionTypeEmoji(question.questionType)}</span>
              <span>{question.questionText}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {question.questionType === "single_choice" ||
            question.questionType === "multiple_choice" ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {question.totalResponses} responses
                </div>
                {Object.keys(question.answerDistribution).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(question.answerDistribution).map(([key, value]) => ({ name: key, value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No responses yet
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-4">
                  {question.totalResponses} responses
                </div>
                {question.textResponses && question.textResponses.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {question.textResponses.map((response, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-md bg-muted/50"
                        >
                          <p className="text-sm">{response}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No responses yet
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
