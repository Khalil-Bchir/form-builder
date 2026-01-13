import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getForm } from "@/features/forms/lib/form-queries"
import { generateQRCode } from "@/features/qr/lib/qr-generator"

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

    const { data: form, error: formError } = await getForm(id)

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Check ownership
    if (form.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const formUrl = `${baseUrl}/f/${form.slug}?source=qr`

    // Generate QR code
    const qrCodeDataURL = await generateQRCode(formUrl)

    // Create PDF using a simple HTML to PDF approach
    // For production, consider using a proper PDF library like pdfkit or puppeteer
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }
    h1 {
      margin-bottom: 10px;
      color: #1a1a1a;
    }
    p {
      color: #666;
      margin-bottom: 30px;
    }
    .qr-code {
      margin: 20px 0;
    }
    .url {
      margin-top: 20px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
      word-break: break-all;
      font-size: 12px;
      color: #333;
    }
  </style>
</head>
<body>
  <h1>${form.title}</h1>
  ${form.description ? `<p>${form.description}</p>` : ""}
  <div class="qr-code">
    <img src="${qrCodeDataURL}" alt="QR Code" />
  </div>
  <div class="url">${formUrl}</div>
</body>
</html>
    `

    // Return HTML that can be printed to PDF by the browser
    // In production, you might want to use a server-side PDF generation library like puppeteer or pdfkit
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${form.slug}-qr-code.html"`,
      },
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate QR code"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
