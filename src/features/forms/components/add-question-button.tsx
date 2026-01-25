"use client"

import { useState } from "react"
import { Plus, FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { QuestionType } from "@/types/database.types"
import { getQuestionTypeEmoji, getQuestionTypeLabel } from "../lib/form-utils"

interface AddQuestionButtonProps {
  onAdd: (type: QuestionType) => void
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export function AddQuestionButton({
  onAdd,
  variant = "outline",
  className,
}: AddQuestionButtonProps) {
  const [selectedType, setSelectedType] = useState<QuestionType>("short_text")

  const handleAdd = () => {
    onAdd(selectedType)
    setSelectedType("short_text") // Reset to default
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors bg-muted/30">
        <div className="flex-1 flex items-center gap-3">
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as QuestionType)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_text">
                {getQuestionTypeEmoji("short_text")} {getQuestionTypeLabel("short_text")}
              </SelectItem>
              <SelectItem value="long_text">
                {getQuestionTypeEmoji("long_text")} {getQuestionTypeLabel("long_text")}
              </SelectItem>
              <SelectItem value="single_choice">
                {getQuestionTypeEmoji("single_choice")} {getQuestionTypeLabel("single_choice")}
              </SelectItem>
              <SelectItem value="multiple_choice">
                {getQuestionTypeEmoji("multiple_choice")} {getQuestionTypeLabel("multiple_choice")}
              </SelectItem>
              <SelectItem value="rating">
                {getQuestionTypeEmoji("rating")} {getQuestionTypeLabel("rating")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={variant}
            onClick={handleAdd}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Ajouter une question
          </Button>
        </div>
      </div>
    </div>
  )
}
