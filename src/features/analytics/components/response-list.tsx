"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import type { FormResponse } from "../types/analytics"
import { QrCode, Link as LinkIcon } from "lucide-react"

interface ResponseListProps {
  responses: FormResponse[]
}

export function ResponseList({ responses }: ResponseListProps) {
  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="text-lg">Recent Responses</CardTitle>
        <CardDescription>
          Latest {responses.length} {responses.length === 1 ? "response" : "responses"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {responses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No responses yet</p>
            <p className="text-xs mt-1">
              Responses will appear here once your form is submitted
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] lg:h-[calc(100vh-280px)]">
            <div className="space-y-3 pr-4">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className="p-4 border rounded-lg space-y-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {response.source === "qr" ? (
                        <QrCode className="size-4 text-muted-foreground" />
                      ) : (
                        <LinkIcon className="size-4 text-muted-foreground" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {response.source.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(response.created_at), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {response.answers.map((answer, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-foreground">
                          {answer.questionText}:
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {answer.answer.length > 100 
                            ? `${answer.answer.substring(0, 100)}...` 
                            : answer.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
