import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated or if there's an auth error
  if (!user || error) {
    redirect("/auth/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 flex h-14 sm:h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-2 sm:px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4 hidden sm:block"
            />
            <div className="flex-1 min-w-0">
              <DynamicBreadcrumbs />
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
