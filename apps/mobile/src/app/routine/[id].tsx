import { EXERCISE_BY_ID, EXERCISES, makeRoutine, now, parseWorkout, type Prescribed } from "@anygym/core";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Button, Card, Input, Label, Screen, s } from "@/components/ui";
import { useData } from "@/lib/data";
import { C } from "@/lib/theme";

export default function RoutineEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, upsert, remove } = useData();
  const existing = routines.find((r) => r.id === id);
  const [name, setName] = useState(existing?.name ?? "");
  const [text, setText] = useState(existing?.text ?? "");
  // Manual matches for lines the parser didn't recognize, keyed by lowercased name.
  const [overrides, setOverrides] = useState<Record<string, string>>(() =>
    Object.fromEntries((existing?.exercises ?? []).filter((e) => e.exerciseId).map((e) => [e.rawName.toLowerCase(), e.exerciseId!])),
  );
  const [picking, setPicking] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const exercises: Prescribed[] = useMemo(
    () =>
      parseWorkout(text).map((p) => {
        const o = overrides[p.rawName.toLowerCase()];
        return o && (!p.exerciseId || o !== p.exerciseId) ? { ...p, exerciseId: o } : p;
      }),
    [text, overrides],
  );
  const unknown = exercises.filter((e) => !e.exerciseId).length;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? EXERCISES.filter((e) => e.name.toLowerCase().includes(q)) : EXERCISES).slice(0, 8);
  }, [query]);

  function save() {
    const routine = existing
      ? { ...existing, name: name.trim(), text, exercises, updatedAt: now() }
      : { ...makeRoutine(name.trim(), text), exercises };
    upsert("routines", routine);
    router.back();
  }

  function confirmDelete() {
    Alert.alert(`Delete “${existing?.name}”?`, "Past workouts stay in your history.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove("routines", existing!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen footer={<Button title="Save routine" onPress={save} disabled={!name.trim() || !exercises.length} />}>
      <Stack.Screen
        options={{
          title: existing ? "Edit routine" : "New routine",
          headerRight: existing
            ? () => (
                <Pressable onPress={confirmDelete} hitSlop={10}>
                  <Text style={{ color: C.rose, fontSize: 15 }}>Delete</Text>
                </Pressable>
              )
            : undefined,
        }}
      />
      <Label>Name</Label>
      <Input value={name} onChangeText={setName} placeholder="e.g. Lower Strength" />

      <Label>Exercises, one per line</Label>
      <Input
        value={text}
        onChangeText={setText}
        multiline
        autoCapitalize="sentences"
        autoCorrect={false}
        placeholder={"Back squat 4x6 @ 225\nRDL 3x8 @ 185\nPull-ups 4x8"}
        style={{ minHeight: 150, textAlignVertical: "top", fontFamily: "Menlo", fontSize: 14, lineHeight: 22 }}
      />
      <Text style={s.mute}>Format: name, sets×reps, optional load (@ 225 or 100kg).</Text>

      <Label>Recognized · {exercises.length}</Label>
      {exercises.map((p) => {
        const key = p.rawName.toLowerCase();
        const open = picking === key;
        return (
          <Card key={p.uid} style={{ paddingVertical: 10, gap: 8 }}>
            <Pressable onPress={() => { setPicking(open ? null : key); setQuery(""); }} style={[s.row, { justifyContent: "space-between" }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: p.exerciseId ? C.ink : C.amber, fontSize: 15, fontWeight: "600" }}>
                  {p.exerciseId ? EXERCISE_BY_ID[p.exerciseId]?.name : `“${p.rawName}”: tap to match`}
                </Text>
                {p.exerciseId && EXERCISE_BY_ID[p.exerciseId]?.name.toLowerCase() !== key && (
                  <Text style={[s.mute, { fontSize: 12 }]}>from “{p.rawName}” · tap to change</Text>
                )}
              </View>
              <Text style={[s.mono, { color: C.mute }]}>
                {p.sets}×{p.reps}
                {p.loadLbs ? ` @${p.loadLbs}` : ""}
              </Text>
            </Pressable>
            {open && (
              <View style={{ gap: 4 }}>
                <Input value={query} onChangeText={setQuery} placeholder="Search exercises" autoFocus />
                {matches.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => {
                      setOverrides({ ...overrides, [key]: m.id });
                      setPicking(null);
                    }}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text style={{ color: m.id === p.exerciseId ? C.lime : C.ink, fontSize: 15 }}>{m.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Card>
        );
      })}
      {unknown > 0 && (
        <Text style={{ color: C.amber, fontSize: 13 }}>
          {unknown} not recognized. Tap to pick the closest exercise so it can be adapted.
        </Text>
      )}
    </Screen>
  );
}
