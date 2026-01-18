"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import * as z from "zod"
import Link from "next/link"
import { toast } from "sonner"
import { Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"

const forgotPasswordSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse e-mail valide"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSubmitted(true)
      toast.success("E-mail de réinitialisation envoyé ! Vérifiez votre boîte de réception.")
    } catch (error) {
      toast.error("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Vérifiez votre e-mail</h2>
            <p className="text-muted-foreground mt-2">
              Nous vous avons envoyé un lien de réinitialisation de mot de passe. Veuillez vérifier votre e-mail
              et cliquer sur le lien pour réinitialiser votre mot de passe.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Retour à la connexion</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-xl font-bold">Réinitialiser le mot de passe</h1>
              <FieldDescription>
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser
                votre mot de passe.
              </FieldDescription>
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@exemple.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </Field>
                </FormItem>
              )}
            />
            <Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </Button>
            </Field>
            <FieldDescription className="text-center">
              <Link href="/auth/login" className="text-primary underline">
                Retour à la connexion
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </Form>
    </div>
  )
}
