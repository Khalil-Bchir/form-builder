import { notFound } from "next/navigation"
import { PublicFormRenderer } from "@/features/forms/components/public-form-renderer"
import { getFormWithQuestionsBySlug } from "@/features/forms/lib/form-queries"

interface PublicFormPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ source?: string }>
}

export default async function PublicFormPage({
  params,
  searchParams,
}: PublicFormPageProps) {
  const { slug } = await params
  const { source } = await searchParams

  const { data: form, error } = await getFormWithQuestionsBySlug(slug)

  if (error || !form) {
    notFound()
  }

  const submissionSource = (source === "qr" ? "qr" : "web") as "qr" | "web"

  return <PublicFormRenderer form={form} source={submissionSource} />
}
