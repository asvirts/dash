import { useState } from "react";
import { Text } from "react-native";
import { Button, Card, Input, Label, Notice, Screen, s } from "@/components/ui";
import { useData } from "@/lib/data";

export default function Account() {
  const { mode, email, cloudAvailable, signIn, signUp, signOut } = useData();
  const [e, setE] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState<null | "in" | "up" | "out">(null);
  const [msg, setMsg] = useState<{ tone: "lime" | "rose"; text: string } | null>(null);

  async function run(kind: "in" | "up" | "out") {
    setBusy(kind);
    setMsg(null);
    try {
      if (kind === "in") await signIn(e, pw);
      if (kind === "up") setMsg({ tone: "lime", text: await signUp(e, pw) });
      if (kind === "out") await signOut();
    } catch (err) {
      setMsg({ tone: "rose", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(null);
    }
  }

  if (mode === "cloud")
    return (
      <Screen>
        <Card>
          <Text style={s.mute}>Signed in as</Text>
          <Text style={[s.h2, { marginTop: 2 }]}>{email}</Text>
          <Text style={[s.mute, { marginTop: 8 }]}>Routines, gyms and workouts sync with the RepRelay web app.</Text>
        </Card>
        <Button title="Sign out" variant="danger" onPress={() => run("out")} loading={busy === "out"} />
      </Screen>
    );

  return (
    <Screen>
      <Notice tone="lime">
        Guest mode: your data is saved on this iPhone only. Sign in to sync with the web app and back it up. Your
        guest data moves over on first sign-in.
      </Notice>
      {!cloudAvailable ? (
        <Notice tone="rose">Cloud sync isn&apos;t configured in this build (missing Supabase env vars).</Notice>
      ) : (
        <>
          <Label>Email</Label>
          <Input value={e} onChangeText={setE} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
          <Label>Password</Label>
          <Input value={pw} onChangeText={setPw} secureTextEntry autoComplete="password" placeholder="••••••••" />
          {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
          <Button title="Sign in" onPress={() => run("in")} loading={busy === "in"} disabled={!e || !pw} />
          <Button title="Create account" variant="ghost" onPress={() => run("up")} loading={busy === "up"} disabled={!e || pw.length < 6} />
        </>
      )}
    </Screen>
  );
}
