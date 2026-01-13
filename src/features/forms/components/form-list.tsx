"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, FileText, MoreVertical, Eye, Settings, BarChart3, Trash2, Cog } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import type { Form } from "../types/form"
import { format } from "date-fns"

export function FormList() {
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadForms()
  }, [])

  async function loadForms() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setForms(data || [])
    } catch (error) {
      console.error("Error loading forms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(formId: string) {
    if (!confirm("Are you sure you want to delete this form?")) return

    const { error } = await supabase.from("forms").delete().eq("id", formId)

    if (error) {
      console.error("Error deleting form:", error)
      return
    }

    setForms(forms.filter((f) => f.id !== formId))
  }

  async function handleTogglePublish(formId: string, currentStatus: string) {
    const newStatus = currentStatus === "published" ? "draft" : "published"
    const { error } = await supabase
      .from("forms")
      .update({ status: newStatus })
      .eq("id", formId)

    if (error) {
      toast.error("Failed to update form status")
      console.error("Error updating form status:", error)
      return
    }

    setForms(
      forms.map((f) => (f.id === formId ? { ...f, status: newStatus as "draft" | "published" } : f))
    )
    toast.success(
      newStatus === "published"
        ? "Form published successfully!"
        : "Form moved to draft"
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Forms</h1>
          <p className="text-muted-foreground">
            Create and manage your forms
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="size-4 mr-2" />
            New Form
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first form
            </p>
            <Button asChild>
              <Link href="/dashboard/forms/new">
                <Plus className="size-4 mr-2" />
                Create Form
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {form.description || "No description"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/forms/${form.id}/edit`}>
                          <Settings className="size-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/forms/${form.id}/settings`}>
                          <Cog className="size-4 mr-2" />
                          Settings & Publish
                        </Link>
                      </DropdownMenuItem>
                      {form.status === "published" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/f/${form.slug}`} target="_blank">
                              <Eye className="size-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/forms/${form.id}/analytics`}>
                              <BarChart3 className="size-4 mr-2" />
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(form.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={form.status === "published" ? "default" : "secondary"}
                    >
                      {form.status}
                    </Badge>
                    {form.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(form.id, form.status)}
                        className="h-7 text-xs"
                      >
                        Publish
                      </Button>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(form.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
