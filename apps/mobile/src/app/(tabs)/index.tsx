import { sessionStats, startSession } from "@reprelay/core";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Button, Card, Chip, Label, MatchPill, Screen, Title, s } from "@/components/ui";
import { useData } from "@/lib/data";
import { C } from "@/lib/theme";

export default function Today() {
  const { routines, gyms, sessions, currentGymId, setCurrentGymId, upsert, mode } = useData();
  const [routineId, setRoutineId] = useState<string | null>(null);

  const gym = gyms.find((g) => g.id === currentGymId) ?? null;
  const active = sessions.find((x) => !x.finishedAt);
  const lastDone = sessions.find((x) => x.finishedAt);
  // Default to the routine after the one done last, so the rotation continues.
  const suggested = useMemo(() => {
    if (!routines.length) return null;
    const i = routines.findIndex((r) => r.id === lastDone?.routineId);
    return routines[(i + 1) % routines.length];
  }, [routines, lastDone]);
  const routine = routines.find((r) => r.id === routineId) ?? suggested;

  const preview = useMemo(() => (routine ? sessionStats(startSession(routine, gym)) : null), [routine, gym]);

  async function start() {
    if (!routine) return;
    const session = startSession(routine, gym);
    await upsert("sessions", session);
    router.push(`/session/${session.id}`);
  }

  return (
    <Screen
      footer={
        <Button title={active ? "Start a new workout" : `Start ${routine?.name ?? "workout"}`} onPress={start} disabled={!routine} />
      }
    >
      <View style={[s.row, { justifyContent: "space-between", marginTop: 8 }]}>
        <Title>Today</Title>
        <Pressable onPress={() => router.push("/account")} hitSlop={12}>
          <Text style={{ color: mode === "cloud" ? C.lime : C.mute, fontSize: 14 }}>{mode === "cloud" ? "Synced ●" : "Guest"}</Text>
        </Pressable>
      </View>

      {active && (
        <Card onPress={() => router.push(`/session/${active.id}`)} style={{ borderColor: C.lime }}>
          <Text style={[s.label, { color: C.lime }]}>In progress</Text>
          <Text style={[s.h2, { marginTop: 4 }]}>{active.routineName}</Text>
          <Text style={s.mute}>
            {active.gymName} · {sessionStats(active).done}/{sessionStats(active).sets} sets · tap to resume
          </Text>
        </Card>
      )}

      <Label>Where are you training?</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {gyms.map((g) => (
          <Chip
            key={g.id}
            label={`${g.kind === "home" ? "🏠" : "🧳"} ${g.name}`}
            active={g.id === currentGymId}
            onPress={() => setCurrentGymId(g.id)}
          />
        ))}
        <Chip label="📷 Scan a new gym" onPress={() => router.push("/gym/new?scan=1")} />
      </ScrollView>

      <Label>Workout</Label>
      {routines.map((r) => {
        const on = r.id === routine?.id;
        return (
          <Card key={r.id} onPress={() => setRoutineId(r.id)} style={on ? { borderColor: C.lime } : null}>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Text style={s.h2}>{r.name}</Text>
              {on && preview && <MatchPill match={preview.avgMatch} />}
            </View>
            <Text style={[s.mute, { marginTop: 4 }]} numberOfLines={2}>
              {r.exercises.map((e) => e.rawName).join(" · ")}
            </Text>
            {on && preview && (
              <Text style={{ color: preview.swaps ? C.amber : C.lime, marginTop: 8, fontSize: 13 }}>
                {preview.swaps
                  ? `${preview.swaps} exercise${preview.swaps === 1 ? "" : "s"} adapted for ${gym?.name ?? "this gym"}`
                  : `Everything available at ${gym?.name ?? "this gym"} ✓`}
              </Text>
            )}
          </Card>
        );
      })}
      {!routines.length && (
        <Button title="Create your first routine" variant="outline" onPress={() => router.push("/routine/new")} />
      )}
    </Screen>
  );
}
