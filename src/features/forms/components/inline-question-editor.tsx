"use client"

import { useState, useRef, useEffect } from "react"
import { GripVertical, MoreVertical, Trash2, Copy, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import type { FormQuestionWithOptions, QuestionType } from "@/types/database.types"
import { getQuestionTypeEmoji, getQuestionTypeLabel } from "../lib/form-utils"
import { cn } from "@/lib/utils"

interface InlineQuestionEditorProps {
  question: FormQuestionWithOptions
  index: number
  onUpdate: (question: Omit<FormQuestionWithOptions, "id" | "form_id" | "created_at">) => void
  onDelete: () => void
  onDuplicate?: () => void
  onAddAfter?: () => void
  defaultEditing?: boolean
}

export function InlineQuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddAfter,
  defaultEditing = false,
}: InlineQuestionEditorProps) {
  const [isEditing, setIsEditing] = useState(defaultEditing || !question.text.trim())
  const [text, setText] = useState(question.text)
  const [type, setType] = useState<QuestionType>((question.type as QuestionType) || "short_text")
  const [required, setRequired] = useState(question.required ?? false)
  const [options, setOptions] = useState<string[]>(question.options || [])
  const [newOption, setNewOption] = useState("")
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    if (!text.trim()) {
      setText(question.text)
      setIsEditing(false)
      return
    }

    if ((type === "single_choice" || type === "multiple_choice") && options.length === 0) {
      // Keep editing if no options
      return
    }

    onUpdate({
      order: question.order,
      type,
      text: text.trim(),
      required: required ?? false,
      options: type === "single_choice" || type === "multiple_choice" ? options : undefined,
      section_id: question.section_id ?? null,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setText(question.text)
    setType((question.type as QuestionType) || "short_text")
    setRequired(question.required ?? false)
    setOptions(question.options || [])
    setIsEditing(false)
  }

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()])
      setNewOption("")
    }
  }

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const needsOptions = type === "single_choice" || type === "multiple_choice"

  if (isEditing) {
    return (
      <div className="bg-background border-2 border-primary rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <GripVertical className="size-5 text-muted-foreground mt-2 cursor-move" />
          <div className="flex-1 space-y-4">
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Textarea
                  ref={textInputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Question"
                  className="text-base min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      handleSave()
                    }
                    if (e.key === "Escape") {
                      handleCancel()
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as QuestionType)
                  if (value !== "single_choice" && value !== "multiple_choice") {
                    setOptions([])
                  }
                }}
              >
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
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  id={`required-${index}`}
                  checked={required}
                  onCheckedChange={setRequired}
                />
                <Label htmlFor={`required-${index}`} className="text-sm cursor-pointer">
                  Obligatoire
                </Label>
              </div>
            </div>

            {needsOptions && (
              <div className="space-y-2 border-t pt-4">
                <Label className="text-sm font-medium">Options</Label>
                <div className="space-y-2">
                  {options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const updated = [...options]
                            updated[optIndex] = e.target.value
                            setOptions(updated)
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                          className="h-9"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(optIndex)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Ajouter une option"
                      className="h-9"
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
                      size="sm"
                      onClick={handleAddOption}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!text.trim() || (needsOptions && options.length === 0)}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        <GripVertical className="size-5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getQuestionTypeEmoji(question.type)}</span>
                <p className="text-base font-medium">
                  {question.text}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {getQuestionTypeLabel(question.type)}
              </p>
              {needsOptions && question.options && question.options.length > 0 && (
                <div className="mt-2 space-y-1">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="text-sm text-muted-foreground pl-6">
                      {question.type === "single_choice" ? "○" : "☐"} {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  Modifier
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="size-4 mr-2" />
                    Dupliquer
                  </DropdownMenuItem>
                )}
                {onAddAfter && (
                  <DropdownMenuItem onClick={onAddAfter}>
                    <Plus className="size-4 mr-2" />
                    Ajouter après
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="size-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => setIsEditing(true)}
        aria-label="Cliquer pour modifier"
      />
    </div>
  )
}
