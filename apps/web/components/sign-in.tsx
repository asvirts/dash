"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function signInAction(formData: FormData) {
  const supabase = createClient()
  const data = Object.fromEntries(formData)

  console.log(data)

  const {
    data: { user },
    error
  } = await supabase.auth.signInWithPassword({
    email: data.email as string,
    password: data.password as string
  })

  if (user) {
    redirect("/tasks")
  }

  if (error) {
    console.log(error.message)
    redirect("/error")
  }
}

export async function SignIn() {
  return (
    <form action={signInAction}>
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
          Sign In
        </button>
      </div>
    </form>
  )
}
