import { SignupForm } from "@/features/auth/components/signup-form"

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10">
      <div className="w-full max-w-sm px-2 sm:px-0">
        <SignupForm />
      </div>
    </div>
  )
}
