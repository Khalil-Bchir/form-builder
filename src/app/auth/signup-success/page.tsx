import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function SignupSuccessPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-6 text-primary" />
          </div>
          <CardTitle className="text-lg sm:text-xl">Check your email</CardTitle>
          <CardDescription className="text-sm">
            We&apos;ve sent you a verification link. Please check your email and
            click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Didn&apos;t receive the email?</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
