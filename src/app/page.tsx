import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, BarChart3, QrCode } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <main className="w-full max-w-4xl space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Create Forms That Work
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Build beautiful forms, collect responses, and analyze data with our
            powerful form builder platform.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-6">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Easy Form Builder</h3>
            <p className="text-sm text-muted-foreground">
              Create forms with multiple question types including text, radio
              buttons, and checkboxes.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border p-6">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              View detailed analytics and insights for all your form responses
              in one place.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border p-6">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <QrCode className="size-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">QR Code Sharing</h3>
            <p className="text-sm text-muted-foreground">
              Generate QR codes for your forms and share them easily with your
              audience.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
