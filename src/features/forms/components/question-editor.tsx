"use client"

import { useState } from "react"
import { X, Plus, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import type { FormQuestionWithOptions, QuestionType } from "@/types/database.types"
import { getQuestionTypeLabel, getQuestionTypeEmoji } from "../lib/form-utils"

interface QuestionEditorProps {
  question?: FormQuestionWithOptions
  onSave: (question: Omit<FormQuestionWithOptions, "id" | "form_id" | "created_at">) => void
  onDelete?: () => void
  mode?: "create" | "edit"
}

export function QuestionEditor({
  question,
  onSave,
  onDelete,
  mode = "create",
}: QuestionEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<QuestionType>(
    (question?.type as QuestionType) || "short_text"
  )
  const [text, setText] = useState(question?.text || "")
  const [required, setRequired] = useState(question?.required || false)
  const [options, setOptions] = useState<string[]>(
    question?.options || []
  )
  const [newOption, setNewOption] = useState("")

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()])
      setNewOption("")
    }
  }

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!text.trim()) {
      return
    }

    if ((type === "single_choice" || type === "multiple_choice") && options.length === 0) {
      return
    }

    onSave({
      order: question?.order || 0,
      type,
      text: text.trim(),
      required: required ?? false,
      options: type === "single_choice" || type === "multiple_choice" ? options : undefined,
      section_id: question?.section_id ?? null,
    })

    setIsOpen(false)
    // Reset form if creating new
    if (mode === "create") {
      setType("short_text")
      setText("")
      setRequired(false)
      setOptions([])
      setNewOption("")
    }
  }

  const needsOptions = type === "single_choice" || type === "multiple_choice"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="ghost" size="sm">
            Modifier
          </Button>
        ) : (
          <Button>Ajouter une question</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Modifier la question" : "Ajouter une question"}
          </DialogTitle>
          <DialogDescription>
            Configurez le type de question et les paramètres
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de question</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as QuestionType)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short_text">
                  {getQuestionTypeEmoji("short_text")} Texte court
                </SelectItem>
                <SelectItem value="long_text">
                  {getQuestionTypeEmoji("long_text")} Texte long
                </SelectItem>
                <SelectItem value="single_choice">
                  {getQuestionTypeEmoji("single_choice")} Choix unique
                </SelectItem>
                <SelectItem value="multiple_choice">
                  {getQuestionTypeEmoji("multiple_choice")} Choix multiple
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Texte de la question</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Entrez votre question..."
              rows={2}
            />
          </div>

          {needsOptions && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <GripVertical className="size-4 text-muted-foreground" />
                    <span className="flex-1">{option}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Ajouter une option..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddOption()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="required"
                checked={required}
                onCheckedChange={setRequired}
              />
              <Label htmlFor="required">Obligatoire</Label>
            </div>
            <div className="flex gap-2">
              {mode === "edit" && onDelete && (
                <Button type="button" variant="destructive" onClick={onDelete}>
                  Supprimer
                </Button>
              )}
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
