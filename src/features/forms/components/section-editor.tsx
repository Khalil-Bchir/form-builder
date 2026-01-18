"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FormSection } from "@/types/database.types"

interface SectionEditorProps {
  section?: FormSection
  onSave: (section: Omit<FormSection, "id" | "form_id" | "created_at" | "updated_at">) => void
  onDelete?: () => void
  mode?: "create" | "edit"
}

export function SectionEditor({
  section,
  onSave,
  onDelete,
  mode = "create",
}: SectionEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(section?.title || "")
  const [description, setDescription] = useState(section?.description || "")

  const handleSave = () => {
    if (!title.trim()) {
      return
    }

    onSave({
      order: section?.order || 0,
      title: title.trim(),
      description: description.trim() || null,
    })

    setIsOpen(false)
    // Reset form if creating new
    if (mode === "create") {
      setTitle("")
      setDescription("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="ghost" size="sm">
            Modifier
          </Button>
        ) : (
          <Button variant="outline">Ajouter une section</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Modifier la section" : "Ajouter une section"}
          </DialogTitle>
          <DialogDescription>
            Les sections divisent votre formulaire en pages organisées
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la section *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Informations personnelles"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de cette section..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            {mode === "edit" && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Supprimer
              </Button>
            )}
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
