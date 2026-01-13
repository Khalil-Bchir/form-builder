import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getForms } from "@/features/forms/lib/form-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, FileText, BarChart3 } from "lucide-react"
import { format } from "date-fns"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: forms } = await getForms(user.id)
  const publishedForms = forms?.filter((f) => f.status === "published") || []
  const draftForms = forms?.filter((f) => f.status === "draft") || []

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your forms and view analytics
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="size-4 mr-2" />
            New Form
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {publishedForms.length} published, {draftForms.length} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Published Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedForms.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Forms currently live
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Draft Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftForms.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Forms in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
          </CardHeader>
          <CardContent>
            {forms && forms.length > 0 ? (
              <div className="space-y-2">
                {forms.slice(0, 5).map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{form.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(form.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/forms/${form.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      {form.status === "published" && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/forms/${form.id}/analytics`}>
                            <BarChart3 className="size-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="size-12 mx-auto mb-4 opacity-50" />
                <p>No forms yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/forms/new">Create your first form</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/forms/new">
                <Plus className="size-4 mr-2" />
                Create New Form
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/forms">
                <FileText className="size-4 mr-2" />
                View All Forms
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
