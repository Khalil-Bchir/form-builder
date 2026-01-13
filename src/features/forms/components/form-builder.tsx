"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Eye } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { QuestionEditor } from "./question-editor"
import { QuestionPreview } from "./question-preview"
import type { FormQuestion } from "../types/form"

interface FormBuilderProps {
  formId?: string
  initialTitle?: string
  initialDescription?: string
  initialQuestions?: FormQuestion[]
  onSave: (data: {
    title: string
    description?: string
    questions: Omit<FormQuestion, "id" | "form_id" | "created_at">[]
  }) => Promise<void>
}

export function FormBuilder({
  formId,
  initialTitle = "",
  initialDescription = "",
  initialQuestions = [],
  onSave,
}: FormBuilderProps) {
  const router = useRouter()
  // Initialize state with props - no need to sync since we use key prop for remounting
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [questions, setQuestions] = useState<FormQuestion[]>(initialQuestions)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddQuestion = (
    question: Omit<FormQuestion, "id" | "form_id" | "created_at">
  ) => {
    const newQuestion: FormQuestion = {
      ...question,
      order: questions.length,
    }
    setQuestions([...questions, newQuestion])
    toast.success("Question added")
  }

  const handleUpdateQuestion = (
    index: number,
    question: Omit<FormQuestion, "id" | "form_id" | "created_at">
  ) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...question }
    setQuestions(updated)
    toast.success("Question updated")
  }

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    // Reorder remaining questions
    const reordered = updated.map((q, i) => ({ ...q, order: i }))
    setQuestions(reordered)
    toast.success("Question deleted")
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a form title")
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questions.map((q, index) => ({
          ...q,
          order: index,
        })),
      })
      toast.success("Form saved successfully")
    } catch (error) {
      toast.error("Failed to save form")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {formId ? "Edit Form" : "Create New Form"}
          </h1>
          <p className="text-muted-foreground">
            Build your form by adding questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/forms")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="size-4 mr-2" />
            {isSaving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter form title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter form description..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Questions</CardTitle>
                <QuestionEditor onSave={handleAddQuestion} mode="create" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No questions yet. Add your first question to get started.</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between gap-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {index + 1}. {question.text}
                          {question.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {question.type}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <QuestionEditor
                          question={question}
                          onSave={(q) => handleUpdateQuestion(index, q)}
                          onDelete={() => handleDeleteQuestion(index)}
                          mode="edit"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="size-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {title && (
                <div>
                  <h2 className="text-xl font-bold mb-2">{title}</h2>
                  {description && (
                    <p className="text-muted-foreground mb-4">{description}</p>
                  )}
                </div>
              )}
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Add questions to see preview</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <QuestionPreview
                    key={index}
                    question={question}
                    index={index}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
