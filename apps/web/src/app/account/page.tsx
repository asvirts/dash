"use client";

import { useState } from "react";
import { Button, Card, Input, Loading, PageTitle } from "@/components/ui";
import { useData } from "@/lib/data";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function AccountPage() {
  const { ready, user } = useData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return <Loading />;

  if (!supabaseConfigured || !supabase)
    return (
      <>
        <PageTitle>Account</PageTitle>
        <Card className="text-sm text-mute">
          You’re in <b className="text-ink">guest mode</b>. Your data is saved in this browser only. Accounts and sync turn on once
          Supabase is configured (see README).
        </Card>
      </>
    );

  if (user)
    return (
      <>
        <PageTitle sub="Your routines, gyms and history sync across web and iPhone.">Account</PageTitle>
        <Card className="flex items-center justify-between">
          <div className="text-sm">{user.email}</div>
          <Button variant="outline" onClick={() => supabase!.auth.signOut()}>
            Sign out
          </Button>
        </Card>
      </>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { data, error } =
      mode === "in"
        ? await supabase!.auth.signInWithPassword({ email, password })
        : await supabase!.auth.signUp({ email, password });
    setBusy(false);
    if (error) setMsg({ ok: false, text: error.message });
    else if (mode === "up" && !data.session) setMsg({ ok: true, text: "Check your email to confirm your account, then sign in." });
  }

  return (
    <>
      <PageTitle sub="Sign in to sync across web and iPhone and to use AI gym scanning. Until then, data stays in this browser.">
        {mode === "in" ? "Sign in" : "Create account"}
      </PageTitle>
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
        <Input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
        {msg && <p className={`text-sm ${msg.ok ? "text-lime" : "text-rose"}`}>{msg.text}</p>}
        <Button type="submit" className="w-full py-3" disabled={busy}>
          {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
        </Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-center text-sm text-mute hover:text-ink">
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </form>
      <p className="mt-6 text-xs text-mute">Note: guest data in this browser isn’t merged into your account automatically.</p>
    </>
  );
}
