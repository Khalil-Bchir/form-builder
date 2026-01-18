"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FormSection } from "@/types/database.types"
import { cn } from "@/lib/utils"

interface InlineSectionDividerProps {
  section: FormSection
  onUpdate: (section: Omit<FormSection, "id" | "form_id" | "created_at" | "updated_at">) => void
  onDelete: () => void
  onAddQuestionAfter?: () => void
}

export function InlineSectionDivider({
  section,
  onUpdate,
  onDelete,
  onAddQuestionAfter,
}: InlineSectionDividerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(section.title)
  const [description, setDescription] = useState(section.description || "")
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    if (!title.trim()) {
      setTitle(section.title)
      setIsEditing(false)
      return
    }

    onUpdate({
      order: section.order,
      title: title.trim(),
      description: description.trim() || null,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTitle(section.title)
    setDescription(section.description || "")
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-background border-2 border-primary rounded-lg p-4 space-y-4 my-6">
        <div className="space-y-3">
          <div>
            <Input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la section"
              className="text-lg font-semibold h-11"
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
          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Annuler
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!title.trim()}>
            Enregistrer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative my-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t-2 border-border" />
        <div className="flex items-center gap-3 px-4">
          <div className="text-center">
            <h3
              className={cn(
                "text-lg font-semibold cursor-pointer",
                !section.description && "mb-0"
              )}
              onClick={() => setIsEditing(true)}
            >
              {section.title}
            </h3>
            {section.description && (
              <p
                className="text-sm text-muted-foreground mt-1 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {section.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Modifier
              </DropdownMenuItem>
              {onAddQuestionAfter && (
                <DropdownMenuItem onClick={onAddQuestionAfter}>
                  <Plus className="size-4 mr-2" />
                  Ajouter une question
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
        <div className="flex-1 border-t-2 border-border" />
      </div>
    </div>
  )
}
