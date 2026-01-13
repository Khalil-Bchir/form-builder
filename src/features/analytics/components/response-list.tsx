"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import type { FormResponse } from "../types/analytics"
import { QrCode, Link as LinkIcon } from "lucide-react"

interface ResponseListProps {
  responses: FormResponse[]
}

export function ResponseList({ responses }: ResponseListProps) {
  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No responses yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {responses.map((response) => (
              <div
                key={response.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {response.source === "qr" ? (
                      <QrCode className="size-4 text-muted-foreground" />
                    ) : (
                      <LinkIcon className="size-4 text-muted-foreground" />
                    )}
                    <Badge variant="outline">{response.source}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(response.created_at), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
                <div className="space-y-1 pt-2">
                  {response.answers.map((answer, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{answer.questionText}:</span>{" "}
                      <span className="text-muted-foreground">{answer.answer}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
