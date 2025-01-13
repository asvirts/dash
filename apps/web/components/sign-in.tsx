"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const supabase = createClient()
  const { email, password } = Object.fromEntries(formData)

  const { error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password: password as string
  })

  if (error) {
    redirect("/error")
  }

  redirect("/account")
}
