"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { FileText, BarChart3, Settings, SquarePen, Home } from "lucide-react"

interface BreadcrumbConfig {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

// Route mapping for breadcrumbs
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  forms: "Forms",
  new: "New Form",
  edit: "Edit",
  analytics: "Analytics",
  settings: "Settings",
}

const routeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: Home,
  forms: FileText,
  new: SquarePen,
  edit: SquarePen,
  analytics: BarChart3,
  settings: Settings,
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const [formTitle, setFormTitle] = useState<string | null>(null)

  // Extract form ID from pathname if present
  const formIdMatch = pathname.match(/\/forms\/([0-9a-f-]{36})/i)
  const formId = formIdMatch ? formIdMatch[1] : null

  // Fetch form title if we're on a form detail page
  useEffect(() => {
    if (formId && (pathname.includes("/edit") || pathname.includes("/analytics") || pathname.includes("/settings"))) {
      fetch(`/api/forms/${formId}/title`)
        .then((res) => res.json())
        .then((data) => {
          if (data.title) {
            setFormTitle(data.title)
          }
        })
        .catch(() => {
          // Silently fail - just show default label
        })
    } else {
      setFormTitle(null)
    }
  }, [formId, pathname])

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = (): BreadcrumbConfig[] => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbConfig[] = []

    // Always start with Dashboard
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
    })

    // Build breadcrumbs from segments
    let currentPath = ""
    segments.forEach((segment, index) => {
      // Skip dashboard segment (already added)
      if (segment === "dashboard") return

      currentPath += `/${segment}`

      // Handle dynamic segments (UUIDs)
      if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // This is a form ID
        const isLast = index === segments.length - 1
        breadcrumbs.push({
          label: formTitle || "Form",
          href: isLast ? undefined : currentPath,
          icon: FileText,
        })
        return
      }

      // Get label and icon from mapping
      const label = routeLabels[segment] || segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      
      const icon = routeIcons[segment]

      const isLast = index === segments.length - 1
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        icon,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          const Icon = crumb.icon

          return (
            <div key={`${crumb.label}-${index}`} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="flex items-center gap-1.5">
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {Icon && <Icon className="size-3.5" />}
                    <span className="truncate max-w-[200px]">{crumb.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href!} className="flex items-center gap-1.5 hover:text-foreground">
                      {Icon && <Icon className="size-3.5" />}
                      <span className="truncate max-w-[200px]">{crumb.label}</span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
