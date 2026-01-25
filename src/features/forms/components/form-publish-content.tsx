"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, QrCode, Eye, ExternalLink, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { generateSlug } from "@/features/forms/lib/form-utils"
import { PublicFormRenderer } from "./public-form-renderer"
import type { Form, FormQuestionWithOptions, FormSection, FormWithQuestions } from "@/types/database.types"

type DraftForm = Omit<Form, 'id' | 'user_id'> & { id?: string; user_id?: string }

interface FormPublishContentProps {
  form: Form | DraftForm
  isDraft?: boolean
  title?: string
  description?: string
  questions?: FormQuestionWithOptions[]
  sections?: FormSection[]
  onSave?: () => Promise<void>
  isSaving?: boolean
}

export function FormPublishContent({ 
  form, 
  isDraft = false,
  title,
  description,
  questions = [],
  sections = [],
  onSave,
  isSaving = false
}: FormPublishContentProps) {
  const router = useRouter()
  const [status, setStatus] = useState(form.status)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [formUrl, setFormUrl] = useState("")
  const [previewForm, setPreviewForm] = useState<FormWithQuestions | null>(null)

  const actualSlug = form.slug || (title ? generateSlug(title) : "nouveau-formulaire")
  const actualTitle = form.title || title || "Nouveau formulaire"

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    if (form.id) {
      setFormUrl(`${baseUrl}/f/${form.slug}`)
    } else {
      setFormUrl(`${baseUrl}/f/${actualSlug}`)
    }
  }, [form.slug, form.id, actualSlug])

  // Build preview form from current data
  useEffect(() => {
    if (questions.length > 0 || sections.length > 0 || form.id) {
      // Create preview form from current data
      setPreviewForm({
        ...form,
        title: actualTitle,
        description: description || form.description || null,
        questions: questions.length > 0 ? questions : [],
        sections: sections.length > 0 ? sections : undefined,
      } as FormWithQuestions)
    }
  }, [form, questions, sections, actualTitle, description])

  const handleStatusChange = async (newStatus: "draft" | "published") => {
    // If it's a draft form, save it first
    if (isDraft && !form.id) {
      if (!title?.trim()) {
        toast.error("Veuillez d'abord ajouter un titre au formulaire")
        return
      }
      if (onSave) {
        try {
          await onSave()
          // After saving, the form will have an ID, so refresh and try again
          router.refresh()
          return
        } catch (error) {
          toast.error("Échec de l'enregistrement du formulaire")
          return
        }
      }
    }

    if (!form.id) {
      toast.error("Le formulaire doit être enregistré avant de changer le statut")
      return
    }

    setIsSavingStatus(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("forms")
        .update({ status: newStatus })
        .eq("id", form.id)
      
      if (error) {
        throw new Error(error.message)
      }
      setStatus(newStatus)
      toast.success(
        newStatus === "published"
          ? "Formulaire publié avec succès ! Vous pouvez maintenant générer le code QR et partager l'URL."
          : "Formulaire enregistré en brouillon"
      )
      router.refresh()
    } catch (error) {
      toast.error("Échec de la mise à jour du statut")
    } finally {
      setIsSavingStatus(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(formUrl)
      setIsCopied(true)
      toast.success("URL copiée dans le presse-papiers")
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error("Échec de la copie de l'URL")
    }
  }

  const handleDownloadQR = async () => {
    if (!form.id) {
      toast.error("Le formulaire doit être enregistré pour générer un code QR")
      return
    }

    setIsGeneratingQR(true)
    try {
      const response = await fetch(`/api/forms/${form.id}/qr-pdf`, {
        method: "GET",
      })

      if (!response.ok) throw new Error("Failed to generate QR code")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const newWindow = window.open(url, "_blank")
      
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print()
            URL.revokeObjectURL(url)
          }, 500)
        }
        toast.success("Code QR ouvert pour l'impression")
      } else {
        const a = document.createElement("a")
        a.href = url
        a.download = `${form.slug}-qr-code.html`
        document.body.appendChild(a)
        a.click()
        URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Code QR téléchargé")
      }
    } catch (error) {
      toast.error("Échec de la génération du code QR")
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handlePreview = () => {
    if (!form.id) {
      toast.error("Le formulaire doit être enregistré pour voir l'aperçu")
      return
    }
    window.open(formUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Aperçu et publication</h2>
        <p className="text-sm text-muted-foreground">
          Prévisualisez votre formulaire et publiez-le pour obtenir l'URL et le code QR. Si vous ne publiez pas, le formulaire sera enregistré en brouillon.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Publishing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Statut de publication</CardTitle>
            <CardDescription>
              Contrôlez la visibilité de votre formulaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="status">Statut</Label>
                <p className="text-sm text-muted-foreground">
                  {status === "published" 
                    ? "Votre formulaire est visible publiquement"
                    : "Votre formulaire est en brouillon"}
                </p>
              </div>
              <Badge variant={status === "published" ? "default" : "secondary"}>
                {status === "published" ? "Publié" : "Brouillon"}
              </Badge>
            </div>

            <div className="space-y-2">
              <Select
                value={status}
                onValueChange={(value: "draft" | "published") => handleStatusChange(value)}
                disabled={isSavingStatus || isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                </SelectContent>
              </Select>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium mb-1">
                  {status === "draft" ? "Formulaire en brouillon" : "Formulaire publié"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {status === "draft" 
                    ? "Votre formulaire est enregistré en brouillon et n'est pas accessible publiquement. Vous pouvez le publier à tout moment pour le rendre accessible via l'URL et le code QR."
                    : "Votre formulaire est publié et accessible publiquement. Vous pouvez générer le code QR et partager l'URL avec vos utilisateurs."}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>URL du formulaire</Label>
              <div className="flex gap-2">
                <Input
                  value={formUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                  title="Copier l'URL"
                >
                  {isCopied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Partagez cette URL pour permettre aux utilisateurs d'accéder à votre formulaire
              </p>
            </div>

            {form.id ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="flex-1"
                >
                  <Eye className="size-4 mr-2" />
                  Aperçu
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(formUrl, "_blank")}
                  className="flex-1"
                >
                  <ExternalLink className="size-4 mr-2" />
                  Ouvrir
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <p>Enregistrez le formulaire pour accéder à l'aperçu</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle>Code QR</CardTitle>
            <CardDescription>
              Générez un code QR pour partager votre formulaire facilement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Téléchargez un code QR que vous pouvez imprimer ou partager. Le code QR redirige directement vers votre formulaire.
              </p>
            </div>

            <Button
              onClick={handleDownloadQR}
              disabled={isGeneratingQR || status !== "published" || !form.id}
              className="w-full"
            >
              <QrCode className="size-4 mr-2" />
              {isGeneratingQR ? "Génération..." : "Télécharger le code QR"}
            </Button>

            {!form.id && (
              <p className="text-xs text-muted-foreground text-center">
                Enregistrez d'abord votre formulaire pour générer un code QR
              </p>
            )}
            {form.id && status !== "published" && (
              <p className="text-xs text-muted-foreground text-center">
                Publiez d'abord votre formulaire pour générer un code QR
              </p>
            )}

            <Separator />

            <div className="space-y-2">
              <Label>Utilisation du code QR</Label>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Imprimez le code QR sur des documents marketing</li>
                <li>Partagez-le sur les réseaux sociaux</li>
                <li>Ajoutez-le à vos supports de communication</li>
                <li>Utilisez-le lors d'événements ou de présentations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section - Show prominently at the top */}
      {previewForm && (previewForm.questions.length > 0 || form.id) && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu du formulaire</CardTitle>
            <CardDescription>
              Voici comment votre formulaire apparaîtra aux utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-background max-h-[600px] overflow-y-auto">
              <div className="p-4 sm:p-6 md:p-8">
                <PublicFormRenderer form={previewForm} source="web" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(!previewForm || (previewForm.questions.length === 0 && !form.id)) && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu du formulaire</CardTitle>
            <CardDescription>
              L'aperçu sera disponible une fois le formulaire enregistré
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Enregistrez d'abord votre formulaire pour voir l'aperçu</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de partage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-semibold">Titre</Label>
              <p className="text-sm text-muted-foreground mt-1">{actualTitle}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold">Slug</Label>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{actualSlug}</p>
            </div>
            {(form.description || description) && (
              <div className="md:col-span-2">
                <Label className="text-sm font-semibold">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{form.description || description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
