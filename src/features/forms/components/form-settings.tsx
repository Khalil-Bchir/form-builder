"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Download, QrCode, Eye, Palette, Layout, Type, Sparkles, Building2, Mail, Phone, Globe, Image, Upload, X, Loader2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import type { Form, FormTheme, FormLayout, FormFontFamily, ButtonStyle } from "../types/form"
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
  const [color, setColor] = useState(form.color)
  const [theme, setTheme] = useState<FormTheme>(form.theme || "light")
  const [layout, setLayout] = useState<FormLayout>(form.layout || "centered")
  const [fontFamily, setFontFamily] = useState<FormFontFamily>(form.font_family || "inter")
  const [backgroundColor, setBackgroundColor] = useState(form.background_color || "#ffffff")
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>(form.button_style || "default")
  const [buttonColor, setButtonColor] = useState(form.button_color || form.color)
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
    setColor(form.color)
    setTheme(form.theme || "light")
    setLayout(form.layout || "centered")
    setFontFamily(form.font_family || "inter")
    setBackgroundColor(form.background_color || "#ffffff")
    setButtonStyle(form.button_style || "default")
    setButtonColor(form.button_color || form.color)
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
      toast.error("Title is required")
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

      toast.success("Settings saved successfully")
      await onUpdate()
      router.refresh()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save settings"
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
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploadingLogo(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to upload files")
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
      toast.success("Logo uploaded successfully")
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload logo"
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
    toast.success("Logo removed")
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
        toast.success("QR code opened for printing")
      } else {
        // Fallback: download as HTML
        const a = document.createElement("a")
        a.href = url
        a.download = `${form.slug}-qr-code.html`
        document.body.appendChild(a)
        a.click()
        URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("QR code downloaded")
      }
    } catch (error) {
      toast.error("Failed to generate QR code")
    } finally {
      setIsGeneratingQR(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Form Settings</h1>
          <p className="text-muted-foreground">
            Configure your form details and publishing options
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="size-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your form title, description, and URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>
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
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="form-slug"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSlug}
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Form URL: {formUrl}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-4" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the visual style of your form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={(value) => setTheme(value as FormTheme)}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layout">Layout</Label>
                  <Select value={layout} onValueChange={(value) => setLayout(value as FormLayout)}>
                    <SelectTrigger id="layout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered">Centered</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font_family">Font Family</Label>
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
                <Label htmlFor="color">Primary Color</Label>
                <div className="grid grid-cols-4 gap-2 mb-2">
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
                      className={`h-10 rounded-md border-2 transition-all ${
                        color === preset.value
                          ? "border-foreground scale-105"
                          : "border-border hover:border-foreground/50"
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="size-4" />
                Publishing
              </CardTitle>
              <CardDescription>
                Control form visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {status === "published"
                      ? "Form is live and accessible"
                      : "Form is in draft mode"}
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
                    <Label>Share Form</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input value={formUrl} readOnly className="text-xs" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(formUrl)
                            toast.success("Link copied to clipboard")
                          }}
                        >
                          Copy
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
                        {isGeneratingQR ? "Generating..." : "Download QR Code"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <a href={formUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="size-4 mr-2" />
                          Preview Form
                        </a>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Button & Interaction
              </CardTitle>
              <CardDescription>
                Customize button styles and form behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="button_style">Button Style</Label>
                <Select value={buttonStyle} onValueChange={(value) => setButtonStyle(value as ButtonStyle)}>
                  <SelectTrigger id="button_style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="pill">Pill</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_color">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="button_color"
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    placeholder={color}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_progress">Show Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Display progress indicator during submission
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4" />
                Branding & Contact
              </CardTitle>
              <CardDescription>
                Add your company branding and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_branding">Show Branding</Label>
                  <p className="text-sm text-muted-foreground">
                    Display branding information on the form
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
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_logo">Company Logo</Label>
                      
                      {companyLogoUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="flex items-center justify-center w-20 h-20 border rounded-md overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={companyLogoUrl}
                                alt="Logo preview"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                Logo uploaded
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
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={companyLogoUrl}
                              onChange={(e) => setCompanyLogoUrl(e.target.value)}
                              placeholder="Or enter a URL manually"
                              className="text-xs"
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
                                  {isUploadingLogo ? "Uploading..." : "Upload Logo"}
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
                                Or
                              </span>
                            </div>
                          </div>
                          <Input
                            value={companyLogoUrl}
                            onChange={(e) => setCompanyLogoUrl(e.target.value)}
                            placeholder="Enter logo URL manually"
                            disabled={isUploadingLogo}
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload an image file (max 5MB) or enter a URL. Supported formats: JPEG, PNG, GIF, WebP, SVG
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email" className="flex items-center gap-2">
                          <Mail className="size-4" />
                          Contact Email
                        </Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="contact@company.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone" className="flex items-center gap-2">
                          <Phone className="size-4" />
                          Contact Phone
                        </Label>
                        <Input
                          id="contact_phone"
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_url" className="flex items-center gap-2">
                        <Globe className="size-4" />
                        Website URL
                      </Label>
                      <Input
                        id="website_url"
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://www.company.com"
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
