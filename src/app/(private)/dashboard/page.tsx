import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getForms } from "@/features/forms/lib/form-queries"
import { getResponseStats, getResponseTrends } from "@/features/analytics/lib/analytics-queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Plus, 
  FileText, 
  BarChart3, 
  SquarePen, 
  TrendingUp, 
  Users, 
  QrCode, 
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock
} from "lucide-react"
import { format, subDays, isAfter } from "date-fns"

async function getOverallStats(userId: string) {
  const supabase = await createClient()
  const { data: forms } = await getForms(userId)
  
  if (!forms || forms.length === 0) {
    return {
      totalForms: 0,
      publishedForms: 0,
      draftForms: 0,
      totalResponses: 0,
      qrResponses: 0,
      webResponses: 0,
      recentResponses: 0,
      topForms: [],
    }
  }

  const publishedForms = forms.filter((f) => f.status === "published")
  
  // Get total responses across all forms
  const formIds = publishedForms.map((f) => f.id)
  let totalResponses = 0
  let qrResponses = 0
  let webResponses = 0
  let recentResponses = 0
  
  if (formIds.length > 0) {
    const sevenDaysAgo = subDays(new Date(), 7)
    
    const { count: totalCount } = await supabase
      .from("form_responses")
      .select("id", { count: "exact", head: true })
      .in("form_id", formIds)
    
    const { count: qrCount } = await supabase
      .from("form_responses")
      .select("id", { count: "exact", head: true })
      .in("form_id", formIds)
      .eq("source", "qr")
    
    const { count: webCount } = await supabase
      .from("form_responses")
      .select("id", { count: "exact", head: true })
      .in("form_id", formIds)
      .eq("source", "web")
    
    const { count: recentCount } = await supabase
      .from("form_responses")
      .select("id", { count: "exact", head: true })
      .in("form_id", formIds)
      .gte("created_at", sevenDaysAgo.toISOString())
    
    totalResponses = totalCount || 0
    qrResponses = qrCount || 0
    webResponses = webCount || 0
    recentResponses = recentCount || 0
  }

  // Get top performing forms (by response count)
  const topForms = await Promise.all(
    publishedForms.slice(0, 5).map(async (form) => {
      const stats = await getResponseStats(form.id)
      return {
        ...form,
        responseCount: stats.total,
      }
    })
  )

  topForms.sort((a, b) => b.responseCount - a.responseCount)

  return {
    totalForms: forms.length,
    publishedForms: publishedForms.length,
    draftForms: forms.filter((f) => f.status === "draft").length,
    totalResponses,
    qrResponses,
    webResponses,
    recentResponses,
    topForms: topForms.slice(0, 5),
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: forms } = await getForms(user.id)
  const stats = await getOverallStats(user.id)
  const publishedForms = forms?.filter((f) => f.status === "published") || []
  
  // Calculate response rate (responses per published form)
  const avgResponsesPerForm = stats.publishedForms > 0 
    ? Math.round(stats.totalResponses / stats.publishedForms) 
    : 0

  // Get recent activity (last 5 responses across all forms)
  const formIds = publishedForms.map((f) => f.id)
  let recentActivity: Array<{
    id: string
    form_title: string
    form_id: string
    created_at: string
    source: "qr" | "web"
  }> = []

  if (formIds.length > 0) {
    const { data: recentResponses } = await supabase
      .from("form_responses")
      .select("id, form_id, created_at, source, forms!inner(title)")
      .in("form_id", formIds)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentResponses) {
      recentActivity = recentResponses.map((r: any) => ({
        id: r.id,
        form_title: r.forms.title,
        form_id: r.form_id,
        created_at: r.created_at,
        source: r.source,
      }))
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
            Aperçu de vos formulaires et réponses
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/forms/new">
            <Plus className="size-4 mr-2" />
            Nouveau formulaire
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total des formulaires</CardTitle>
            <FileText className="size-3 sm:size-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalForms}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.publishedForms} publiés • {stats.draftForms} brouillons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total des réponses</CardTitle>
            <Users className="size-3 sm:size-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalResponses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.recentResponses} dans les 7 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Moyenne par formulaire</CardTitle>
            <TrendingUp className="size-3 sm:size-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{avgResponsesPerForm}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Réponses par formulaire publié
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Sources des réponses</CardTitle>
            <Activity className="size-3 sm:size-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <div className="text-lg sm:text-xl font-bold">{stats.qrResponses}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <QrCode className="size-3" />
                  Code QR
                </p>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold">{stats.webResponses}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Globe className="size-3" />
                  Web
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-5 md:gap-6 lg:grid-cols-3">
        {/* Top Performing Forms */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Formulaires les plus performants</CardTitle>
                  <CardDescription>
                    Formulaires avec le plus de réponses
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/forms">
                    Voir tout
                    <ArrowUpRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stats.topForms.length > 0 ? (
                <div className="space-y-3">
                  {stats.topForms.map((form, index) => (
                    <Link
                      key={form.id}
                      href={`/dashboard/forms/${form.id}/analytics`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center size-8 sm:size-10 rounded-lg bg-primary/10 text-primary font-semibold flex-shrink-0 text-sm sm:text-base">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium truncate group-hover:text-primary transition-colors">
                            {form.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {form.description || "Aucune description"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm sm:text-base font-semibold">{form.responseCount.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">réponses</p>
                        </div>
                        <BarChart3 className="size-4 sm:size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="size-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Aucun formulaire publié pour le moment</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/forms/new">Créer votre premier formulaire</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Forms */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Formulaires récents</CardTitle>
                  <CardDescription>
                    Votre dernière activité de formulaire
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/forms">
                    Voir tout
                    <ArrowUpRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {forms && forms.length > 0 ? (
                <div className="space-y-2">
                  {forms.slice(0, 5).map((form) => (
                    <div
                      key={form.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm sm:text-base font-medium truncate">{form.title}</p>
                          <Badge
                            variant={form.status === "published" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {form.status === "published" ? "Publié" : "Brouillon"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(form.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/forms/${form.id}/edit`}>
                            <SquarePen className="size-4" />
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
                  <p className="mb-2">Aucun formulaire pour le moment</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/forms/new">Créer votre premier formulaire</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Recent Activity & Quick Stats */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1 lg:order-2">
          {/* Recent Activity */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest form submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/dashboard/forms/${activity.form_id}/analytics`}
                      className="block p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {activity.form_title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(activity.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs flex-shrink-0"
                        >
                          {activity.source === "qr" ? (
                            <QrCode className="size-3" />
                          ) : (
                            <Globe className="size-3" />
                          )}
                          {activity.source.toUpperCase()}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu rapide</CardTitle>
              <CardDescription>
                Statistiques en un coup d'œil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Formulaires publiés</span>
                  <span className="font-semibold">{stats.publishedForms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Formulaires brouillons</span>
                  <span className="font-semibold">{stats.draftForms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total des réponses</span>
                  <span className="font-semibold">{stats.totalResponses.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cette semaine</span>
                  <span className="font-semibold text-primary">{stats.recentResponses}</span>
                </div>
              </div>
              {stats.publishedForms > 0 && (
                <div className="pt-4 border-t">
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/dashboard/forms">
                      <FileText className="size-4 mr-2" />
                      Gérer les formulaires
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
