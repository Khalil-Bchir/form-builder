import { redirect } from "next/navigation"
import { FormSettings } from "@/features/forms/components/form-settings"
import { createClient } from "@/lib/supabase/server"
import { getForm } from "@/features/forms/lib/form-queries"
import { revalidatePath } from "next/cache"

interface FormSettingsPageProps {
  params: Promise<{ id: string }>
}

export default async function FormSettingsPage({ params }: FormSettingsPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: form, error } = await getForm(id)

  if (error || !form) {
    redirect("/dashboard/forms")
  }

  // Check ownership
  if (form.user_id !== user.id) {
    redirect("/dashboard/forms")
  }

  async function handleUpdate() {
    "use server"
    revalidatePath(`/dashboard/forms/${id}/settings`)
    revalidatePath("/dashboard/forms")
  }

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 lg:p-8 overflow-x-hidden max-w-full min-w-0">
      <div className="w-full min-w-0 max-w-full">
        <FormSettings form={form} onUpdate={handleUpdate} />
      </div>
    </div>
  )
}
