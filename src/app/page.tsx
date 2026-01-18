import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, BarChart3, QrCode } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 sm:p-5 md:p-6 lg:p-8">
      <main className="w-full max-w-4xl space-y-8 sm:space-y-10 md:space-y-12 text-center">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Créez des Formulaires Efficaces
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground px-2">
            Créez de beaux formulaires, collectez des réponses et analysez les données avec notre
            plateforme puissante de création de formulaires.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/auth/signup">Commencer</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/auth/login">Se connecter</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-4 sm:p-5 md:p-6">
            <div className="flex size-10 sm:size-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 sm:size-6 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold">Créateur de Formulaires Simple</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Créez des formulaires avec plusieurs types de questions incluant texte, boutons radio
              et cases à cocher.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border p-4 sm:p-5 md:p-6">
            <div className="flex size-10 sm:size-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-5 sm:size-6 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold">Tableau de Bord Analytique</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Consultez des analyses détaillées et des insights pour toutes vos réponses de formulaires
              en un seul endroit.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border p-4 sm:p-5 md:p-6">
            <div className="flex size-10 sm:size-12 items-center justify-center rounded-lg bg-primary/10">
              <QrCode className="size-5 sm:size-6 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold">Partage par Code QR</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Générez des codes QR pour vos formulaires et partagez-les facilement avec votre
              audience.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
