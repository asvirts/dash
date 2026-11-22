import {
  EXERCISE_BY_ID,
  formatSets,
  isSwapped,
  lastPerformance,
  now,
  repick,
  sessionStats,
  type Session,
  type SessionEntry,
  type SetLog,
} from "@reprelay/core";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Button, Card, Empty, MatchPill, Notice, Progress, Screen, s } from "@/components/ui";
import { useData } from "@/lib/data";
import { C, R } from "@/lib/theme";

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions, gyms, upsert, remove } = useData();
  const stored = sessions.find((x) => x.id === id);
  const [session, setSession] = useState<Session | undefined>(stored);
  const [openSwap, setOpenSwap] = useState<string | null>(null);

  // Debounced autosave; flush on leave.
  const pending = useRef<Session | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    if (pending.current) upsert("sessions", pending.current);
    pending.current = null;
  };
  useEffect(() => flush, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return <Empty>Workout not found.</Empty>;

  const gym = gyms.find((g) => g.id === session.gymId) ?? null;
  const st = sessionStats(session);
  const finished = !!session.finishedAt;

  function save(next: Session, immediate = false) {
    setSession(next);
    pending.current = next;
    if (timer.current) clearTimeout(timer.current);
    if (immediate) flush();
    else timer.current = setTimeout(flush, 600);
  }

  function updateEntry(uid: string, fn: (e: SessionEntry) => SessionEntry) {
    save({ ...session!, entries: session!.entries.map((e) => (e.uid === uid ? fn(e) : e)) });
  }

  function updateSet(uid: string, i: number, patch: Partial<SetLog>) {
    updateEntry(uid, (e) => ({ ...e, sets: e.sets.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  }

  function finish() {
    save({ ...session!, finishedAt: now() }, true);
    router.back();
  }

  function confirmDelete() {
    Alert.alert("Delete this workout?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          pending.current = null;
          remove("sessions", session!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen
      footer={
        <>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <Text style={s.mute}>Progress</Text>
            <Text style={s.mono}>
              {st.done}/{st.sets} sets
            </Text>
          </View>
          <Progress value={st.sets ? st.done / st.sets : 0} />
          {!finished && <Button title="Finish workout" onPress={finish} />}
        </>
      }
    >
      <Stack.Screen
        options={{
          title: session.routineName,
          headerRight: () => (
            <Pressable onPress={confirmDelete} hitSlop={10}>
              <Text style={{ color: C.rose, fontSize: 15 }}>Delete</Text>
            </Pressable>
          ),
        }}
      />

      <Card style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Stat value={session.gymName} label="gym" />
        <Stat value={String(st.swaps)} label="swaps" />
        <Stat value={`${st.avgMatch}%`} label="match" accent />
      </Card>
      {st.swaps > 0 && (
        <Notice tone={st.intact ? "lime" : "amber"}>
          {st.intact
            ? "✓ Training intent preserved. Each swap trains the same movement pattern."
            : "⚠ Some movements only have partial matches at this gym."}
        </Notice>
      )}
      {finished && <Notice>Finished {new Date(session.finishedAt!).toLocaleString()}</Notice>}

      {session.entries.map((e, i) => {
        const last = e.exerciseId ? lastPerformance(sessions, e.exerciseId, session.id) : null;
        const swapping = openSwap === e.uid;
        return (
          <Card key={e.uid} style={{ gap: 8 }}>
            <View style={[s.row, { alignItems: "flex-start" }]}>
              <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: C.panel2, alignItems: "center", justifyContent: "center" }}>
                <Text style={[s.mono, { fontSize: 12 }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                {isSwapped(e) && (
                  <Text style={[s.mute, { textDecorationLine: "line-through", fontSize: 13 }]}>
                    {e.original.exerciseId ? EXERCISE_BY_ID[e.original.exerciseId]?.name : e.original.rawName}
                  </Text>
                )}
                <Text style={s.h2}>{e.exerciseName}</Text>
                <Text style={[s.mono, { color: C.mute, marginTop: 2 }]}>
                  {e.sets.length} × {e.targetReps}
                  {e.loadHint ? ` · ${e.loadHint}` : ""}
                </Text>
              </View>
              {e.match != null && (
                <Pressable onPress={() => setOpenSwap(swapping ? null : e.uid)} hitSlop={8} style={{ alignItems: "flex-end", gap: 4 }}>
                  <MatchPill match={e.match} />
                  {e.options.length > 1 && <Text style={{ color: C.mute, fontSize: 12 }}>{swapping ? "close" : "swap ⇄"}</Text>}
                </Pressable>
              )}
            </View>

            {e.match == null && (
              <Text style={{ color: C.rose, fontSize: 14 }}>
                {e.original.exerciseId ? "Nothing here trains this pattern. Skip it or add sets elsewhere." : "Exercise not recognized. Edit the routine to fix it."}
              </Text>
            )}
            {e.cues.map((c) => (
              <Text key={c} style={[s.mute, { fontSize: 13 }]}>
                • {c}
              </Text>
            ))}
            {last && (
              <Text style={{ color: C.mute, fontSize: 13 }}>
                Last time: <Text style={{ color: C.ink }}>{formatSets(last.sets)}</Text>
              </Text>
            )}

            {swapping && (
              <View style={{ backgroundColor: C.panel2, borderRadius: R.md, padding: 4 }}>
                {e.options.map((o, j) => (
                  <Pressable
                    key={o.exerciseId}
                    onPress={() => {
                      updateEntry(e.uid, (x) => repick(x, j, gym));
                      setOpenSwap(null);
                    }}
                    style={[s.row, { justifyContent: "space-between", padding: 10 }]}
                  >
                    <Text style={{ color: j === e.pick ? C.lime : C.ink, fontSize: 15, flex: 1 }}>
                      {j === e.pick ? "● " : "○ "}
                      {EXERCISE_BY_ID[o.exerciseId]?.name ?? o.exerciseId}
                    </Text>
                    <MatchPill match={o.match} />
                  </Pressable>
                ))}
              </View>
            )}

            {e.sets.map((set, j) => (
              <SetRow
                key={j}
                n={j + 1}
                set={set}
                hint={last?.sets[j] ?? last?.sets[last.sets.length - 1]}
                onChange={(patch) => updateSet(e.uid, j, patch)}
              />
            ))}
          </Card>
        );
      })}
    </Screen>
  );
}

function num(t: string) {
  const v = parseFloat(t.replace(",", "."));
  return Number.isFinite(v) ? v : null;
}

function SetRow({ n, set, hint, onChange }: { n: number; set: SetLog; hint?: SetLog; onChange: (p: Partial<SetLog>) => void }) {
  const box = {
    flex: 1,
    minWidth: 0,
    backgroundColor: C.panel2,
    borderRadius: R.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: C.ink,
    fontSize: 16,
    textAlign: "center" as const,
  };
  return (
    <View style={[s.row, { opacity: set.done ? 0.65 : 1 }]}>
      <Text style={[s.mono, { width: 22, color: C.mute }]}>{n}</Text>
      <TextInput
        style={box}
        keyboardType="decimal-pad"
        placeholder={hint?.weight != null ? `${hint.weight}` : "lb"}
        placeholderTextColor={C.mute}
        value={set.weight != null ? String(set.weight) : ""}
        onChangeText={(t) => onChange({ weight: num(t) })}
        selectTextOnFocus
      />
      <Text style={s.mute}>×</Text>
      <TextInput
        style={box}
        keyboardType="number-pad"
        placeholder="reps"
        placeholderTextColor={C.mute}
        value={set.reps != null ? String(set.reps) : ""}
        onChangeText={(t) => onChange({ reps: num(t) })}
        selectTextOnFocus
      />
      <Pressable
        onPress={() =>
          onChange({ done: !set.done, weight: set.weight ?? (!set.done ? (hint?.weight ?? null) : null) })
        }
        hitSlop={6}
        style={{
          width: 44,
          height: 38,
          borderRadius: R.sm,
          borderWidth: 1,
          borderColor: set.done ? C.lime : C.line,
          backgroundColor: set.done ? C.lime : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: set.done ? C.bg : C.mute, fontWeight: "700", fontSize: 16 }}>✓</Text>
      </Pressable>
    </View>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ color: accent ? C.lime : C.ink, fontSize: 18, fontWeight: "700" }} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[s.label, { fontSize: 10, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}
