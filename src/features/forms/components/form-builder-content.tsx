"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { InlineQuestionEditor } from "./inline-question-editor"
import { InlineSectionDivider } from "./inline-section-divider"
import { AddQuestionButton } from "./add-question-button"
import { AddSectionButton } from "./add-section-button"
import type { FormQuestionWithOptions, FormSection, QuestionType } from "@/types/database.types"

interface FormBuilderContentProps {
  formId?: string
  title: string
  description: string
  questions: FormQuestionWithOptions[]
  sections: FormSection[]
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onQuestionsChange: (questions: FormQuestionWithOptions[]) => void
  onSectionsChange: (sections: FormSection[]) => void
}

export function FormBuilderContent({
  formId,
  title,
  description,
  questions,
  sections,
  onTitleChange,
  onDescriptionChange,
  onQuestionsChange,
  onSectionsChange,
}: FormBuilderContentProps) {
  // Create a flat list of items (questions and sections) in order
  type FormItem = 
    | { type: "question"; data: FormQuestionWithOptions; questionIndex: number }
    | { type: "section"; data: FormSection; sectionIndex: number }

  const buildItemList = (): FormItem[] => {
    const items: FormItem[] = []
    
    // Sort questions by order
    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order)
    const sortedSections = [...sections].sort((a, b) => a.order - b.order)

    // Group questions by section
    const questionsBySection = sortedQuestions.reduce((acc, q) => {
      const sectionId = q.section_id || "no-section"
      if (!acc[sectionId]) {
        acc[sectionId] = []
      }
      acc[sectionId].push(q)
      return acc
    }, {} as Record<string, FormQuestionWithOptions[]>)

    const questionsWithoutSection = questionsBySection["no-section"] || []

    // Build items in order: questions without section, then sections with their questions
    // Add questions without section first
    questionsWithoutSection.forEach((q) => {
      const questionIndex = questions.findIndex((q2) => q2.id === q.id)
      items.push({ type: "question", data: q, questionIndex })
    })

    // Add sections with their questions
    sortedSections.forEach((section) => {
      const sectionKey = section.id || `order-${section.order}`
      const sectionQuestions = questionsBySection[sectionKey] || []
      const sectionIndex = sections.findIndex((s) => s.id === section.id || (s.order === section.order && !s.id))
      
      items.push({ type: "section", data: section, sectionIndex })
      
      sectionQuestions.forEach((q) => {
        const questionIndex = questions.findIndex((q2) => q2.id === q.id)
        items.push({ type: "question", data: q, questionIndex })
      })
    })

    return items
  }

  const items = buildItemList()

  const handleAddQuestion = (type: QuestionType, afterIndex?: number, sectionId?: string | null) => {
    const newQuestion: FormQuestionWithOptions = {
      id: `temp-${Date.now()}-${Math.random()}`,
      form_id: formId || "",
      created_at: new Date().toISOString(),
      order: afterIndex !== undefined ? afterIndex + 1 : questions.length,
      type,
      text: "",
      required: false,
      options: type === "single_choice" || type === "multiple_choice" ? [] : null,
      section_id: sectionId || null,
    }

    if (afterIndex !== undefined) {
      const updated = [...questions]
      updated.splice(afterIndex + 1, 0, newQuestion)
      // Reorder all questions
      const reordered = updated.map((q, i) => ({ ...q, order: i }))
      onQuestionsChange(reordered)
    } else {
      onQuestionsChange([...questions, newQuestion])
    }
  }

  const handleAddSection = (afterIndex?: number) => {
    const newOrder = afterIndex !== undefined ? afterIndex + 1 : sections.length
    const newSection: FormSection = {
      id: `order-${newOrder}`,
      form_id: formId || "",
      created_at: null,
      updated_at: null,
      order: newOrder,
      title: "Nouvelle section",
      description: null,
    }

    if (afterIndex !== undefined) {
      const updated = [...sections]
      updated.splice(afterIndex + 1, 0, newSection)
      const reordered = updated.map((s, i) => ({ ...s, order: i, id: s.id?.startsWith("order-") ? `order-${i}` : s.id }))
      onSectionsChange(reordered)
    } else {
      onSectionsChange([...sections, newSection])
    }
  }

  const handleUpdateQuestion = (
    index: number,
    question: Omit<FormQuestionWithOptions, "id" | "form_id" | "created_at">
  ) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...question }
    onQuestionsChange(updated)
  }

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    const reordered = updated.map((q, i) => ({ ...q, order: i }))
    onQuestionsChange(reordered)
  }

  const handleDuplicateQuestion = (index: number) => {
    const question = questions[index]
    const newQuestion: FormQuestionWithOptions = {
      ...question,
      id: `temp-${Date.now()}-${Math.random()}`,
      text: `${question.text} (copie)`,
      order: index + 1,
    }
    const updated = [...questions]
    updated.splice(index + 1, 0, newQuestion)
    const reordered = updated.map((q, i) => ({ ...q, order: i }))
    onQuestionsChange(reordered)
  }

  const handleUpdateSection = (
    index: number,
    section: Omit<FormSection, "id" | "form_id" | "created_at" | "updated_at">
  ) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], ...section }
    onSectionsChange(updated)
  }

  const handleDeleteSection = (index: number) => {
    const section = sections[index]
    const sectionKey = section.id || `order-${section.order}`
    
    const updated = sections.filter((_, i) => i !== index)
    const reordered = updated.map((s, i) => {
      const newId = s.id?.startsWith("order-") ? `order-${i}` : s.id
      return { ...s, order: i, id: newId || s.id }
    })
    
    const updatedQuestions = questions.map((q) => {
      if (!q.section_id) return q
      const qSectionKey = q.section_id.startsWith("order-") ? q.section_id : q.section_id
      if (qSectionKey === sectionKey || q.section_id === section.id) {
        return { ...q, section_id: null }
      }
      if (q.section_id.startsWith("order-")) {
        const orderMatch = q.section_id.match(/^order-(\d+)$/)
        if (orderMatch) {
          const oldOrder = parseInt(orderMatch[1], 10)
          if (oldOrder > index) {
            const newSection = reordered[oldOrder - 1]
            if (newSection) {
              return { ...q, section_id: newSection.id || `order-${oldOrder - 1}` }
            }
          }
        }
      }
      return q
    })
    
    onQuestionsChange(updatedQuestions)
    onSectionsChange(reordered)
  }


  return (
    <>
      <CardHeader>
        <CardTitle>Contenu du formulaire</CardTitle>
        <CardDescription>
          Ajoutez des questions et des sections à votre formulaire
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Header */}
        <div className="space-y-4 pb-6 border-b">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Titre du formulaire <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Formulaire sans titre"
              className="text-xl font-semibold h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Description du formulaire"
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        {/* Questions and Sections */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="space-y-4 mt-4">
              <AddQuestionButton
                onAdd={(type) => handleAddQuestion(type)}
              />
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-border" />
                <span className="text-sm text-muted-foreground">ou</span>
                <div className="flex-1 border-t border-border" />
              </div>
              <AddSectionButton onAdd={() => handleAddSection()} />
            </div>
          ) : (
            <>
              {items.map((item, itemIndex) => {
                if (item.type === "section") {
                  return (
                    <div key={`section-${item.sectionIndex}`}>
                      <InlineSectionDivider
                        section={item.data}
                        onUpdate={(s) => handleUpdateSection(item.sectionIndex, s)}
                        onDelete={() => handleDeleteSection(item.sectionIndex)}
                        onAddQuestionAfter={() => {
                          // Add question after this section, in this section
                          const sectionKey = item.data.id || `order-${item.data.order}`
                          handleAddQuestion("short_text", undefined, sectionKey)
                        }}
                      />
                      <AddQuestionButton
                        onAdd={(type) => {
                          // Add question in this section
                          const sectionKey = item.data.id || `order-${item.data.order}`
                          handleAddQuestion(type, undefined, sectionKey)
                        }}
                        className="mt-2"
                      />
                    </div>
                  )
                } else {
                  return (
                    <div key={`question-${item.questionIndex}`}>
                      <InlineQuestionEditor
                        question={item.data}
                        index={item.questionIndex}
                        onUpdate={(q) => handleUpdateQuestion(item.questionIndex, q)}
                        onDelete={() => handleDeleteQuestion(item.questionIndex)}
                        onDuplicate={() => handleDuplicateQuestion(item.questionIndex)}
                        onAddAfter={() => {
                          // Preserve section_id when adding after
                          handleAddQuestion("short_text", item.questionIndex, item.data.section_id)
                        }}
                        defaultEditing={!item.data.text.trim()}
                      />
                      <AddQuestionButton
                        onAdd={(type) => {
                          // Preserve section_id when adding after
                          handleAddQuestion(type, item.questionIndex, item.data.section_id)
                        }}
                        className="mt-2"
                      />
                    </div>
                  )
                }
              })}

              {/* Add Section Button at the end */}
              <AddSectionButton onAdd={() => handleAddSection()} />
            </>
          )}
        </div>
      </CardContent>
    </>
  )
}
