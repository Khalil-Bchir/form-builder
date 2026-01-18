"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Download, QrCode, Eye, Palette, Layout, Type, Sparkles, Building2, Mail, Phone, Globe, Image, Upload, X, Loader2, Check } from "lucide-react"
import Color from "color"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/ui/shadcn-io/color-picker"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import type { Form, FormTheme, FormLayout, FormFontFamily, ButtonStyle } from "@/types/database.types"
import { generateSlug } from "../lib/form-utils"

interface FormSettingsProps {
  form: Form
  onUpdate: () => void
}

const THEME_PRESETS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
]

export function FormSettings({ form, onUpdate }: FormSettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const brandBucket = process.env.NEXT_PUBLIC_STORAGE_BRAND_BUCKET || "brand"
  const [title, setTitle] = useState(form.title)
  const [description, setDescription] = useState(form.description || "")
  const [slug, setSlug] = useState(form.slug)
  const [status, setStatus] = useState(form.status)
  const [color, setColor] = useState(form.color || "#3b82f6")
  const [theme, setTheme] = useState<FormTheme>((form.theme as FormTheme) || "light")
  const [layout, setLayout] = useState<FormLayout>((form.layout as FormLayout) || "centered")
  const [fontFamily, setFontFamily] = useState<FormFontFamily>((form.font_family as FormFontFamily) || "inter")
  const [backgroundColor, setBackgroundColor] = useState(form.background_color || "#ffffff")
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>((form.button_style as ButtonStyle) || "default")
  const [buttonColor, setButtonColor] = useState(form.button_color || form.color || "#3b82f6")
  const [showProgress, setShowProgress] = useState(form.show_progress !== false)
  const [companyName, setCompanyName] = useState(form.company_name || "")
  const [companyLogoUrl, setCompanyLogoUrl] = useState(form.company_logo_url || "")
  const [contactEmail, setContactEmail] = useState(form.contact_email || "")
  const [contactPhone, setContactPhone] = useState(form.contact_phone || "")
  const [websiteUrl, setWebsiteUrl] = useState(form.website_url || "")
  const [showBranding, setShowBranding] = useState(form.show_branding || false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [formUrl, setFormUrl] = useState("")

  // Only sync props to state when form.id changes (form prop might be recreated)
  useEffect(() => {
    setTitle(form.title)
    setDescription(form.description || "")
    setSlug(form.slug)
    setStatus(form.status)
    setColor(form.color || "#3b82f6")
    setTheme((form.theme as FormTheme) || "light")
    setLayout((form.layout as FormLayout) || "centered")
    setFontFamily((form.font_family as FormFontFamily) || "inter")
    setBackgroundColor(form.background_color || "#ffffff")
    setButtonStyle((form.button_style as ButtonStyle) || "default")
    setButtonColor(form.button_color || form.color || "#3b82f6")
    setShowProgress(form.show_progress !== false)
    setCompanyName(form.company_name || "")
    setCompanyLogoUrl(form.company_logo_url || "")
    setContactEmail(form.contact_email || "")
    setContactPhone(form.contact_phone || "")
    setWebsiteUrl(form.website_url || "")
    setShowBranding(form.show_branding || false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id])

  // Set form URL on client side only
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")
    setFormUrl(`${baseUrl}/f/${slug || form.slug}`)
  }, [slug, form.slug])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Le titre est requis")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("forms")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          slug: slug.trim(),
          status,
          color,
          theme,
          layout,
          font_family: fontFamily,
          background_color: backgroundColor,
          button_style: buttonStyle,
          button_color: buttonColor,
          show_progress: showProgress,
          company_name: companyName.trim() || null,
          company_logo_url: companyLogoUrl.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          website_url: websiteUrl.trim() || null,
          show_branding: showBranding,
        })
        .eq("id", form.id)

      if (error) throw error

      toast.success("Paramètres enregistrés avec succès")
      await onUpdate()
      router.refresh()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Échec de l'enregistrement des paramètres"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateSlug = () => {
    const generated = generateSlug(title)
    setSlug(generated)
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      toast.error("Veuillez télécharger un fichier image valide (JPEG, PNG, GIF, WebP ou SVG)")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("La taille du fichier doit être inférieure à 5 Mo")
      return
    }

    setIsUploadingLogo(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Vous devez être connecté pour télécharger des fichiers")
        return
      }

      // Delete old logo if it exists and is from our storage
      if (companyLogoUrl && companyLogoUrl.includes(`/storage/v1/object/public/${brandBucket}/`)) {
        try {
          const urlParts = companyLogoUrl.split(`/${brandBucket}/`)
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1]
            await supabase.storage
              .from(brandBucket)
              .remove([oldFilePath])
          }
        } catch (error) {
          // Ignore errors when deleting old logo
          console.warn("Could not delete old logo:", error)
        }
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${form.id}/${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(brandBucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(brandBucket)
        .getPublicUrl(filePath)

      setCompanyLogoUrl(publicUrl)
      toast.success("Logo téléchargé avec succès")
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Échec du téléchargement du logo"
      toast.error(errorMessage)
      console.error("Logo upload error:", error)
    } finally {
      setIsUploadingLogo(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleRemoveLogo = async () => {
    if (!companyLogoUrl) return

    // If the logo is from our storage, delete it
    if (companyLogoUrl.includes(`/storage/v1/object/public/${brandBucket}/`)) {
      try {
        const urlParts = companyLogoUrl.split(`/${brandBucket}/`)
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          const { error } = await supabase.storage
            .from(brandBucket)
            .remove([filePath])

          if (error) {
            console.error("Error deleting logo:", error)
          }
        }
      } catch (error) {
        console.error("Error deleting logo:", error)
      }
    }

    setCompanyLogoUrl("")
    toast.success("Logo supprimé")
  }

  const handleDownloadQR = async () => {
    setIsGeneratingQR(true)
    try {
      const response = await fetch(`/api/forms/${form.id}/qr-pdf`, {
        method: "GET",
      })

      if (!response.ok) throw new Error("Failed to generate QR code")

      // Open in new window for printing
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
        // Fallback: download as HTML
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

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold break-words">Paramètres du formulaire</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configurez les détails de votre formulaire et les options de publication
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:flex-shrink-0">
          <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            <Save className="size-4 mr-2" />
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2 w-full min-w-0 max-w-full">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6 min-w-0 max-w-full">
          <Card className="min-w-0 max-w-full overflow-x-hidden">
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Mettez à jour le titre, la description et l'URL de votre formulaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du formulaire</Label>
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
              <div className="space-y-2">
                <Label htmlFor="slug">Identifiant URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="identifiant-formulaire"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSlug}
                  >
                    Générer
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL du formulaire : {formUrl}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 max-w-full overflow-x-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-4 flex-shrink-0" />
                Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez le style visuel de votre formulaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Thème</Label>
                  <Select value={theme} onValueChange={(value) => setTheme(value as FormTheme)}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="auto">Auto (Système)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layout">Mise en page</Label>
                  <Select value={layout} onValueChange={(value) => setLayout(value as FormLayout)}>
                    <SelectTrigger id="layout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered">Centré</SelectItem>
                      <SelectItem value="wide">Large</SelectItem>
                      <SelectItem value="full">Pleine largeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font_family">Police de caractères</Label>
                <Select value={fontFamily} onValueChange={(value) => setFontFamily(value as FormFontFamily)}>
                  <SelectTrigger id="font_family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="open-sans">Open Sans</SelectItem>
                    <SelectItem value="lato">Lato</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                    <SelectItem value="poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="color">Couleur principale</Label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        setColor(preset.value)
                        if (!buttonColor || buttonColor === form.color) {
                          setButtonColor(preset.value)
                        }
                      }}
                      className={`relative h-10 rounded-md border-2 transition-all hover:scale-105 ${
                        color === preset.value
                          ? "border-foreground ring-2 ring-foreground/20"
                          : "border-border hover:border-foreground/50"
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    >
                      {color === preset.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="size-4 text-white drop-shadow-md" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-20 p-0 border-2 hover:border-foreground/50 transition-all"
                        style={{ 
                          backgroundColor: color,
                          borderColor: color === "#ffffff" || color === "#fff" ? "hsl(var(--border))" : color
                        }}
                      >
                        <div className="h-full w-full rounded-sm" style={{ backgroundColor: color }} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <ColorPicker
                        value={color || "#3b82f6"}
                        onChange={((rgba: [number, number, number, number]) => {
                          try {
                            const hex = Color.rgb(rgba[0], rgba[1], rgba[2]).hex()
                            setColor(hex)
                            if (!buttonColor || buttonColor === form.color || !form.button_color) {
                              setButtonColor(hex)
                            }
                          } catch (error) {
                            console.error("Error converting color:", error)
                          }
                        }) as any}
                        className="w-64"
                      >
                        <div className="space-y-3">
                          <ColorPickerSelection className="h-40 w-full" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ColorPickerHue className="flex-1" />
                              <ColorPickerEyeDropper />
                            </div>
                            <ColorPickerAlpha />
                          </div>
                          <div className="flex items-center gap-2">
                            <ColorPickerOutput />
                            <ColorPickerFormat className="flex-1" />
                          </div>
                        </div>
                      </ColorPicker>
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value)
                      if (!buttonColor || buttonColor === form.color) {
                        setButtonColor(e.target.value)
                      }
                    }}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color">Couleur de fond</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-20 p-0 border-2 hover:border-foreground/50 transition-all relative"
                        style={{ 
                          backgroundColor: backgroundColor,
                          borderColor: backgroundColor === "#ffffff" || backgroundColor === "#fff" ? "hsl(var(--border))" : backgroundColor
                        }}
                      >
                        <div className="h-full w-full rounded-sm" style={{ backgroundColor: backgroundColor }} />
                        {(backgroundColor === "#ffffff" || backgroundColor === "#fff") && (
                          <div className="absolute inset-0 border border-border rounded-sm" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <ColorPicker
                        value={backgroundColor || "#ffffff"}
                        onChange={((rgba: [number, number, number, number]) => {
                          try {
                            const hex = Color.rgb(rgba[0], rgba[1], rgba[2]).hex()
                            setBackgroundColor(hex)
                          } catch (error) {
                            console.error("Error converting color:", error)
                          }
                        }) as any}
                        className="w-64"
                      >
                        <div className="space-y-3">
                          <ColorPickerSelection className="h-40 w-full" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ColorPickerHue className="flex-1" />
                              <ColorPickerEyeDropper />
                            </div>
                            <ColorPickerAlpha />
                          </div>
                          <div className="flex items-center gap-2">
                            <ColorPickerOutput />
                            <ColorPickerFormat className="flex-1" />
                          </div>
                        </div>
                      </ColorPicker>
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6 min-w-0 max-w-full">
          <Card className="min-w-0 max-w-full overflow-x-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="size-4 flex-shrink-0" />
                Publication
              </CardTitle>
              <CardDescription>
                Contrôler la visibilité du formulaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status">Statut</Label>
                  <p className="text-sm text-muted-foreground">
                    {status === "published"
                      ? "Le formulaire est en ligne et accessible"
                      : "Le formulaire est en mode brouillon"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={status === "published" ? "default" : "secondary"}
                  >
                    {status}
                  </Badge>
                  <Switch
                    id="status"
                    checked={status === "published"}
                    onCheckedChange={(checked) =>
                      setStatus(checked ? "published" : "draft")
                    }
                  />
                </div>
              </div>

              {(status === "published" || form.status === "published") && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Partager le formulaire</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2 min-w-0">
                        <Input value={formUrl} readOnly className="text-xs min-w-0 flex-1" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(formUrl)
                            toast.success("Lien copié dans le presse-papiers")
                          }}
                          className="flex-shrink-0"
                        >
                          Copier
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleDownloadQR}
                        disabled={isGeneratingQR}
                      >
                        <QrCode className="size-4 mr-2" />
                        {isGeneratingQR ? "Génération..." : "Télécharger le code QR"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <a href={formUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="size-4 mr-2" />
                          Aperçu du formulaire
                        </a>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 max-w-full overflow-x-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 flex-shrink-0" />
                Bouton et interaction
              </CardTitle>
              <CardDescription>
                Personnalisez les styles de bouton et le comportement du formulaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="button_style">Style de bouton</Label>
                <Select value={buttonStyle} onValueChange={(value) => setButtonStyle(value as ButtonStyle)}>
                  <SelectTrigger id="button_style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Par défaut</SelectItem>
                    <SelectItem value="rounded">Arrondi</SelectItem>
                    <SelectItem value="pill">Pilule</SelectItem>
                    <SelectItem value="outline">Contour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_color">Couleur du bouton</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-20 p-0 border-2 hover:border-foreground/50 transition-all"
                        style={{ 
                          backgroundColor: buttonColor,
                          borderColor: buttonColor === "#ffffff" || buttonColor === "#fff" ? "hsl(var(--border))" : buttonColor
                        }}
                      >
                        <div className="h-full w-full rounded-sm" style={{ backgroundColor: buttonColor }} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <ColorPicker
                        value={buttonColor || color || "#3b82f6"}
                        onChange={((rgba: [number, number, number, number]) => {
                          try {
                            const hex = Color.rgb(rgba[0], rgba[1], rgba[2]).hex()
                            setButtonColor(hex)
                          } catch (error) {
                            console.error("Error converting color:", error)
                          }
                        }) as any}
                        className="w-64"
                      >
                        <div className="space-y-3">
                          <ColorPickerSelection className="h-40 w-full" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ColorPickerHue className="flex-1" />
                              <ColorPickerEyeDropper />
                            </div>
                            <ColorPickerAlpha />
                          </div>
                          <div className="flex items-center gap-2">
                            <ColorPickerOutput />
                            <ColorPickerFormat className="flex-1" />
                          </div>
                        </div>
                      </ColorPicker>
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    placeholder={color}
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_progress">Afficher la progression</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher l'indicateur de progression pendant la soumission
                  </p>
                </div>
                <Switch
                  id="show_progress"
                  checked={showProgress}
                  onCheckedChange={setShowProgress}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 max-w-full overflow-x-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4 flex-shrink-0" />
                Image de marque et contact
              </CardTitle>
              <CardDescription>
                Ajoutez l'image de marque de votre entreprise et les informations de contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_branding">Afficher l'image de marque</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher les informations de marque sur le formulaire
                  </p>
                </div>
                <Switch
                  id="show_branding"
                  checked={showBranding}
                  onCheckedChange={setShowBranding}
                />
              </div>

              {showBranding && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nom de l'entreprise</Label>
                      <Input
                        id="company_name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nom de votre entreprise"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_logo">Logo de l'entreprise</Label>
                      
                      {companyLogoUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg min-w-0">
                            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border rounded-md overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={companyLogoUrl}
                                alt="Aperçu du logo"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <p className="text-xs sm:text-sm font-medium truncate">
                                Logo téléchargé
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {companyLogoUrl}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveLogo}
                              disabled={isUploadingLogo}
                              className="flex-shrink-0"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2 min-w-0">
                            <Input
                              value={companyLogoUrl}
                              onChange={(e) => setCompanyLogoUrl(e.target.value)}
                              placeholder="Ou entrez une URL manuellement"
                              className="text-xs min-w-0 flex-1"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <label
                              htmlFor="logo-upload"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-accent/50 transition-colors">
                                {isUploadingLogo ? (
                                  <Loader2 className="size-4 text-muted-foreground animate-spin" />
                                ) : (
                                  <Upload className="size-4 text-muted-foreground" />
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {isUploadingLogo ? "Téléchargement..." : "Télécharger le logo"}
                                </span>
                              </div>
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                                onChange={handleLogoUpload}
                                className="hidden"
                                disabled={isUploadingLogo}
                              />
                            </label>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-card px-2 text-muted-foreground">
                                Ou
                              </span>
                            </div>
                          </div>
                          <Input
                            value={companyLogoUrl}
                            onChange={(e) => setCompanyLogoUrl(e.target.value)}
                            placeholder="Entrez l'URL du logo manuellement"
                            disabled={isUploadingLogo}
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Téléchargez un fichier image (max 5 Mo) ou entrez une URL. Formats pris en charge : JPEG, PNG, GIF, WebP, SVG
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email" className="flex items-center gap-2">
                          <Mail className="size-4" />
                          E-mail de contact
                        </Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="contact@entreprise.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone" className="flex items-center gap-2">
                          <Phone className="size-4" />
                          Téléphone de contact
                        </Label>
                        <Input
                          id="contact_phone"
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_url" className="flex items-center gap-2">
                        <Globe className="size-4" />
                        URL du site web
                      </Label>
                      <Input
                        id="website_url"
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://www.entreprise.com"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
