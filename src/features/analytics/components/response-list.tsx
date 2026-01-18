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
    <Card className="h-fit lg:sticky lg:top-6 min-w-0 max-w-full w-full overflow-x-hidden">
      <CardHeader className="px-3 sm:px-4 md:px-6">
        <CardTitle className="text-sm sm:text-base lg:text-lg">Réponses récentes</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Dernières {responses.length} {responses.length === 1 ? "réponse" : "réponses"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6">
        {responses.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground">
            <p className="text-xs sm:text-sm">Aucune réponse pour le moment</p>
            <p className="text-xs mt-1">
              Les réponses apparaîtront ici une fois que votre formulaire sera soumis
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] sm:h-[450px] lg:h-[calc(100vh-280px)]">
            <div className="space-y-2 sm:space-y-3 pr-3 sm:pr-4 md:pr-6">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className="p-2.5 sm:p-3 lg:p-4 border rounded-lg space-y-2 sm:space-y-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-2">
                      {response.source === "qr" ? (
                        <QrCode className="size-3 sm:size-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <LinkIcon className="size-3 sm:size-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        {response.source.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(response.created_at), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-1.5 sm:space-y-2">
                    {response.answers.map((answer, index) => (
                      <div key={index} className="text-xs sm:text-sm">
                        <span className="font-medium text-foreground break-words">
                          {answer.questionText}:
                        </span>{" "}
                        <span className="text-muted-foreground break-words">
                          {answer.answer.length > 80 
                            ? `${answer.answer.substring(0, 80)}...` 
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
