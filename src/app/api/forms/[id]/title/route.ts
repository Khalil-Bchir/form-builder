import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get form title
    const { data: form, error } = await supabase
      .from("forms")
      .select("title, user_id")
      .eq("id", id)
      .single()

    if (error || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Verify ownership
    if (form.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ title: form.title })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
