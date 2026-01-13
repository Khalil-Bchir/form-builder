"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Download, QrCode } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Form } from "../types/form"
import { generateSlug } from "../lib/form-utils"

interface FormSettingsProps {
  form: Form
  onUpdate: () => void
}

export function FormSettings({ form, onUpdate }: FormSettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState(form.title)
  const [description, setDescription] = useState(form.description || "")
  const [slug, setSlug] = useState(form.slug)
  const [status, setStatus] = useState(form.status)
  const [color, setColor] = useState(form.color)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  // Only sync props to state when form.id changes (form prop might be recreated)
  useEffect(() => {
    setTitle(form.title)
    setDescription(form.description || "")
    setSlug(form.slug)
    setStatus(form.status)
    setColor(form.color)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id])

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

  const handleDownloadQR = async () => {
    setIsGeneratingQR(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      const response = await fetch(`/api/forms/${form.id}/qr-pdf`, {
        method: "GET",
      })

      if (!response.ok) throw new Error("Failed to generate QR code")

      // Open in new window for printing
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const newWindow = window.open(url, "_blank")
      
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print()
            window.URL.revokeObjectURL(url)
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
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("QR code downloaded")
      }
    } catch (error) {
      toast.error("Failed to generate QR code")
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const formUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/f/${slug || form.slug}`

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

      <div className="grid gap-6 md:grid-cols-2">
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
            <CardTitle>Publishing</CardTitle>
            <CardDescription>
              Control form visibility and appearance
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

            <div className="space-y-2">
              <Label htmlFor="color">Theme Color</Label>
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

            {(status === "published" || form.status === "published") && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Share Form</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input value={formUrl} readOnly />
                    <Button
                      type="button"
                      variant="outline"
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
                    {isGeneratingQR ? "Generating..." : "Download QR Code PDF"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
