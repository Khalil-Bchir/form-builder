"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QuestionEditor } from "./question-editor"
import { QuestionPreview } from "./question-preview"
import { SectionEditor } from "./section-editor"
import type { FormQuestionWithOptions, FormSection } from "@/types/database.types"
import { cn } from "@/lib/utils"

interface FormBuilderProps {
  formId?: string
  initialTitle?: string
  initialDescription?: string
  initialQuestions?: FormQuestionWithOptions[]
  initialSections?: FormSection[]
  onSave: (data: {
    title: string
    description?: string
    questions: Omit<FormQuestionWithOptions, "id" | "form_id" | "created_at">[]
    sections: Omit<FormSection, "id" | "form_id" | "created_at" | "updated_at">[]
  }) => Promise<void>
}

export function FormBuilder({
  formId,
  initialTitle = "",
  initialDescription = "",
  initialQuestions = [],
  initialSections = [],
  onSave,
}: FormBuilderProps) {
  const router = useRouter()
  // Initialize state with props - no need to sync since we use key prop for remounting
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [questions, setQuestions] = useState<FormQuestionWithOptions[]>(initialQuestions)
  const [sections, setSections] = useState<FormSection[]>(initialSections)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const handleAddQuestion = (
    question: Omit<FormQuestionWithOptions, "id" | "form_id" | "created_at">,
    sectionId?: string | null
  ) => {
    const newQuestion: FormQuestionWithOptions = {
      ...question,
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID for new questions
      form_id: formId || "", // Will be set when saved
      created_at: new Date().toISOString(), // Temporary timestamp
      order: questions.length,
      // Use section_id if provided, otherwise use order-based identifier for new sections
      section_id: sectionId || null,
    }
    setQuestions([...questions, newQuestion])
    toast.success("Question ajoutée")
  }

  const handleAddSection = (
    section: Omit<FormSection, "id" | "form_id" | "created_at" | "updated_at">
  ) => {
    const newOrder = sections.length
    const newSection: FormSection = {
      ...section,
      order: newOrder,
      // Use order-based temporary ID for consistency with question references
      id: `order-${newOrder}`,
      form_id: formId || "", // Will be set when saved
      created_at: null,
      updated_at: null,
    }
    setSections([...sections, newSection])
    setExpandedSections(new Set([...expandedSections, `section-${newOrder}`]))
    toast.success("Section ajoutée")
  }

  const handleUpdateSection = (
    index: number,
    section: Omit<FormSection, "id" | "form_id" | "created_at" | "updated_at">
  ) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], ...section }
    setSections(updated)
    toast.success("Section mise à jour")
  }

  const handleDeleteSection = (index: number) => {
    const section = sections[index]
    const sectionKey = section.id || `order-${section.order}`
    
    // Remove section and reorder remaining sections first
    const updated = sections.filter((_, i) => i !== index)
    const reordered = updated.map((s, i) => {
      // Update temporary IDs for new sections to match new order
      const newId = s.id?.startsWith("order-") ? `order-${i}` : s.id
      return { ...s, order: i, id: newId || s.id }
    })
    
    // Remove section_id from questions in the deleted section
    // Also update questions that reference temporary order-based IDs for sections that shifted
    const updatedQuestions = questions.map((q) => {
      if (!q.section_id) return q
      
      // Check if question belongs to the deleted section
      const qSectionKey = q.section_id.startsWith("order-") 
        ? q.section_id 
        : q.section_id
      if (qSectionKey === sectionKey || q.section_id === section.id) {
        return { ...q, section_id: null }
      }
      
      // If question references a temporary order-based ID, update it if the section shifted
      if (q.section_id.startsWith("order-")) {
        const orderMatch = q.section_id.match(/^order-(\d+)$/)
        if (orderMatch) {
          const oldOrder = parseInt(orderMatch[1], 10)
          if (oldOrder > index) {
            // Section shifted down, update the reference
            const newSection = reordered[oldOrder - 1]
            if (newSection) {
              return { ...q, section_id: newSection.id || `order-${oldOrder - 1}` }
            }
          } else if (oldOrder < index) {
            // Section didn't move, keep the reference
            return q
          }
        }
      }
      
      return q
    })
    
    setQuestions(updatedQuestions)
    setSections(reordered)
    toast.success("Section supprimée")
  }

  const toggleSectionExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleUpdateQuestion = (
    index: number,
    question: Omit<FormQuestionWithOptions, "id" | "form_id" | "created_at">
  ) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...question }
    setQuestions(updated)
    toast.success("Question mise à jour")
  }

  const handleMoveQuestionToSection = (questionIndex: number, sectionId: string | null) => {
    const updated = [...questions]
    updated[questionIndex] = { ...updated[questionIndex], section_id: sectionId }
    setQuestions(updated)
  }

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    // Reorder remaining questions
    const reordered = updated.map((q, i) => ({ ...q, order: i }))
    setQuestions(reordered)
    toast.success("Question supprimée")
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Veuillez entrer un titre de formulaire")
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
        sections: sections.map((s, index) => ({
          title: s.title,
          description: s.description ?? null,
          order: index,
        })),
      })
      toast.success("Formulaire enregistré avec succès")
    } catch (error) {
      toast.error("Échec de l'enregistrement du formulaire")
    } finally {
      setIsSaving(false)
    }
  }

  // Group questions by section (using section_id or order-based temporary ID)
  const questionsBySection = questions.reduce((acc, q) => {
    let sectionKey = "no-section"
    if (q.section_id) {
      sectionKey = q.section_id
    } else {
      // Try to find matching section by order if section_id is order-based
      const matchingSection = sections.find((s) => {
        if (s.id) {
          return s.id === q.section_id
        }
        // For new sections without ID, use order-based matching
        return `order-${s.order}` === q.section_id
      })
      if (matchingSection) {
        sectionKey = matchingSection.id || `order-${matchingSection.order}`
      }
    }
    if (!acc[sectionKey]) {
      acc[sectionKey] = []
    }
    acc[sectionKey].push(q)
    return acc
  }, {} as Record<string, FormQuestionWithOptions[]>)

  const questionsWithoutSection = questionsBySection["no-section"] || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            {formId ? "Modifier le formulaire" : "Créer un nouveau formulaire"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Construisez votre formulaire en ajoutant des questions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.push("/dashboard/forms")} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            <Save className="size-4 mr-2" />
            {isSaving ? "Enregistrement..." : "Enregistrer le formulaire"}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Détails du formulaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du formulaire *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre du formulaire..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Entrez la description du formulaire..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>Sections et Questions</CardTitle>
                <div className="flex gap-2">
                  <SectionEditor onSave={handleAddSection} mode="create" />
                  <QuestionEditor onSave={(q) => handleAddQuestion(q, null)} mode="create" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.length === 0 && questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucune section ou question pour le moment. Ajoutez votre première section ou question pour commencer.</p>
                </div>
              ) : (
                <>
                  {/* Sections with their questions */}
                  {sections.map((section, sectionIndex) => {
                    // Find questions for this section using either real ID or temporary order-based ID
                    const sectionKey = section.id || `order-${section.order}`
                    const sectionQuestions = questionsBySection[sectionKey] || questionsBySection[section.id || ""] || []
                    const expandedKey = `section-${sectionIndex}`
                    const isExpanded = expandedSections.has(expandedKey)
                    
                    return (
                      <div key={sectionIndex} className="border rounded-lg">
                        <div className="p-3 bg-muted/50 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSectionExpanded(expandedKey)}
                                className="h-6 w-6 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="size-4" />
                                ) : (
                                  <ChevronDown className="size-4" />
                                )}
                              </Button>
                              <h3 className="font-semibold">{section.title}</h3>
                              {section.description && (
                                <span className="text-sm text-muted-foreground">
                                  - {section.description}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-8">
                              {sectionQuestions.length} question{sectionQuestions.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <SectionEditor
                            section={section}
                            onSave={(s) => handleUpdateSection(sectionIndex, s)}
                            onDelete={() => handleDeleteSection(sectionIndex)}
                            mode="edit"
                          />
                        </div>
                        {isExpanded && (
                          <div className="p-3 space-y-3 border-t">
                            {sectionQuestions.map((question, qIndex) => {
                              const questionIndex = questions.findIndex((q) => q === question)
                              return (
                                <div key={qIndex} className="space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 border rounded-lg bg-background">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium break-words">
                                        {qIndex + 1}. {question.text}
                                        {question.required && (
                                          <span className="text-destructive ml-1">*</span>
                                        )}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {question.type}
                                      </p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <QuestionEditor
                                        question={question}
                                        onSave={(q) => handleUpdateQuestion(questionIndex, q)}
                                        onDelete={() => handleDeleteQuestion(questionIndex)}
                                        mode="edit"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            <div className="pt-2">
                              <QuestionEditor
                                onSave={(q) => handleAddQuestion(q, section.id || `order-${section.order}`)}
                                mode="create"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Questions without section */}
                  {questionsWithoutSection.length > 0 && (
                    <div className="border rounded-lg">
                      <div className="p-3 bg-muted/50">
                        <h3 className="font-semibold">Questions sans section</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {questionsWithoutSection.length} question{questionsWithoutSection.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="p-3 space-y-3 border-t">
                        {questionsWithoutSection.map((question, qIndex) => {
                          const questionIndex = questions.findIndex((q) => q === question)
                          return (
                            <div key={qIndex} className="space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 border rounded-lg bg-background">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium break-words">
                                    {qIndex + 1}. {question.text}
                                    {question.required && (
                                      <span className="text-destructive ml-1">*</span>
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {question.type}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Select
                                    value={question.section_id || "none"}
                                    onValueChange={(value) =>
                                      handleMoveQuestionToSection(
                                        questionIndex,
                                        value === "none" ? null : value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Assigner à une section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">Aucune section</SelectItem>
                                      {sections.map((section) => (
                                        <SelectItem 
                                          key={section.id || `order-${section.order}`} 
                                          value={section.id || `order-${section.order}`}
                                        >
                                          {section.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <QuestionEditor
                                    question={question}
                                    onSave={(q) => handleUpdateQuestion(questionIndex, q)}
                                    onDelete={() => handleDeleteQuestion(questionIndex)}
                                    mode="edit"
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="size-4" />
                Aperçu
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
              {sections.length === 0 && questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Ajoutez des sections ou questions pour voir l'aperçu</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sections.map((section, sectionIndex) => {
                    // Find questions for this section using either real ID or temporary order-based ID
                    const sectionKey = section.id || `order-${section.order}`
                    const sectionQuestions = questionsBySection[sectionKey] || questionsBySection[section.id || ""] || []
                    return (
                      <div key={sectionIndex} className="space-y-4">
                        <div className="pb-2 border-b">
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {section.description}
                            </p>
                          )}
                        </div>
                        {sectionQuestions.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            Aucune question dans cette section
                          </p>
                        ) : (
                          sectionQuestions.map((question, qIndex) => {
                            const questionIndex = questions.findIndex((q) => q === question)
                            return (
                              <QuestionPreview
                                key={qIndex}
                                question={question}
                                index={questionIndex}
                              />
                            )
                          })
                        )}
                      </div>
                    )
                  })}
                  {questionsWithoutSection.length > 0 && (
                    <div className="space-y-4">
                      {sections.length > 0 && (
                        <div className="pb-2 border-b">
                          <h3 className="text-lg font-semibold">Questions générales</h3>
                        </div>
                      )}
                      {questionsWithoutSection.map((question, qIndex) => {
                        const questionIndex = questions.findIndex((q) => q === question)
                        return (
                          <QuestionPreview
                            key={qIndex}
                            question={question}
                            index={questionIndex}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
