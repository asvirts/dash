"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function registerAction(formData: FormData) {
  const supabase = createClient()
  const data = Object.fromEntries(formData)

  const { error } = await supabase.auth.signUp({
    email: data.email as string,
    password: data.password as string
  })

  if (error) {
    redirect("/error")
  }

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/account")
  }
}

export async function Register() {
  return (
    <form action={registerAction}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Register
        </button>
      </div>
    </form>
  )
}
