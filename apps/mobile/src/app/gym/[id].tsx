import { EQUIPMENT, makeGym, now, type EquipmentId, type Gym } from "@reprelay/core";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Button, Card, Chip, Input, Label, Notice, Screen, Title, s } from "@/components/ui";
import { useData } from "@/lib/data";
import { captureGym, detectEquipment, MAX_FRAMES, type Detection, type Frame } from "@/lib/scan";
import { C, R } from "@/lib/theme";

type Detected = Detection["equipment"][number];

export default function GymEditor() {
  const { id, scan } = useLocalSearchParams<{ id: string; scan?: string }>();
  const { gyms, upsert, remove, setCurrentGymId, accessToken, currentGymId } = useData();
  const existing = gyms.find((g) => g.id === id);

  const [name, setName] = useState(existing?.name ?? "");
  const [kind, setKind] = useState<Gym["kind"]>(existing?.kind ?? "travel");
  const [items, setItems] = useState<EquipmentId[]>(existing?.items ?? []);
  const [maxDb, setMaxDb] = useState<number | null>(existing?.maxDumbbellLbs ?? null);
  const [summary, setSummary] = useState<string | null>(existing?.summary ?? null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [detected, setDetected] = useState<Record<string, Detected>>({});
  const [busy, setBusy] = useState<null | "capture" | "scan">(null);
  const [error, setError] = useState<string | null>(null);
  const showScan = !!scan || !existing;

  async function capture(source: "camera" | "library") {
    setBusy("capture");
    setError(null);
    try {
      const f = await captureGym(source);
      if (f.length) setFrames((prev) => [...prev, ...f]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that media.");
    } finally {
      setBusy(null);
    }
  }

  async function detect() {
    setBusy("scan");
    setError(null);
    try {
      const d = await detectEquipment(frames, await accessToken());
      setDetected(Object.fromEntries(d.equipment.map((x) => [x.id, x])));
      setItems(d.equipment.filter((x) => x.confidence !== "low").map((x) => x.id));
      if (d.max_dumbbell_lbs != null) setMaxDb(d.max_dumbbell_lbs);
      setSummary(d.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed.");
    } finally {
      setBusy(null);
    }
  }

  function toggle(eq: EquipmentId) {
    setItems((l) => (l.includes(eq) ? l.filter((x) => x !== eq) : [...l, eq]));
  }

  function save() {
    const fields = { name: name.trim(), kind, items, maxDumbbellLbs: items.includes("dumbbells") ? maxDb : null, summary };
    const gym = existing ? { ...existing, ...fields, updatedAt: now() } : makeGym(fields);
    upsert("gyms", gym);
    if (!existing) setCurrentGymId(gym.id);
    router.back();
  }

  function confirmDelete() {
    Alert.alert(`Delete “${existing?.name}”?`, undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove("gyms", existing!.id);
          const next = gyms.find((g) => g.id !== existing!.id);
          if (currentGymId === existing!.id && next) setCurrentGymId(next.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen
      footer={
        <Button
          title={existing ? "Save gym" : "Save & train here"}
          onPress={save}
          disabled={!name.trim() || !!busy}
        />
      }
    >
      <Stack.Screen
        options={{
          title: existing ? existing.name : "New gym",
          headerRight: existing
            ? () => (
                <Pressable onPress={confirmDelete} hitSlop={10}>
                  <Text style={{ color: C.rose, fontSize: 15 }}>Delete</Text>
                </Pressable>
              )
            : undefined,
        }}
      />

      {showScan && (
        <>
          <Title sub="Take a photo or a slow panning video of the gym. AI picks out the equipment.">Show me the gym</Title>
          <View style={s.row}>
            <Button title="📷 Photo / video" onPress={() => capture("camera")} style={{ flex: 1 }} loading={busy === "capture"} />
            <Button title="🖼️ Library" variant="ghost" onPress={() => capture("library")} style={{ flex: 1 }} disabled={!!busy} />
          </View>
          {frames.length > 0 && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {frames.map((f, i) => (
                  <Pressable key={f.uri + i} onLongPress={() => setFrames(frames.filter((_, j) => j !== i))}>
                    <Image source={{ uri: f.uri }} style={{ width: 72, height: 72, borderRadius: R.md, borderWidth: 1, borderColor: C.line }} />
                    {f.fromVideo && (
                      <Text style={{ position: "absolute", bottom: 4, left: 4, color: C.ink, fontSize: 10, backgroundColor: C.bg + "cc", paddingHorizontal: 3 }}>
                        ▶
                      </Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
              <Button
                title={`✨ Detect equipment (${Math.min(frames.length, MAX_FRAMES)} frame${frames.length === 1 ? "" : "s"})`}
                variant="outline"
                onPress={detect}
                loading={busy === "scan"}
                disabled={busy === "capture"}
              />
            </>
          )}
        </>
      )}
      {error && <Notice tone="rose">{error}</Notice>}
      {summary && <Notice>{summary}</Notice>}

      <Label>Name</Label>
      <Input value={name} onChangeText={setName} placeholder="e.g. Marriott Denver, Equinox SoHo" />
      <View style={s.row}>
        <Chip label="🧳 Travel" active={kind === "travel"} onPress={() => setKind("travel")} />
        <Chip label="🏠 Home gym" active={kind === "home"} onPress={() => setKind("home")} />
      </View>

      <Label right={<Text style={s.mute}>tap to fix</Text>}>Equipment · {items.length}</Label>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {EQUIPMENT.map((e) => {
          const d = detected[e.id];
          return (
            <Chip
              key={e.id}
              label={`${e.icon} ${e.label}`}
              active={items.includes(e.id)}
              onPress={() => toggle(e.id)}
              dot={d ? (d.confidence === "high" ? C.lime : d.confidence === "medium" ? C.amber : C.rose) : undefined}
            />
          );
        })}
      </View>

      {items.includes("dumbbells") && (
        <Card style={[s.row, { justifyContent: "space-between" }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.body}>Heaviest dumbbell</Text>
            <Text style={[s.mute, { fontSize: 12 }]}>Used to scale reps when the rack runs light</Text>
          </View>
          <Input
            value={maxDb != null ? String(maxDb) : ""}
            onChangeText={(t) => setMaxDb(t ? parseInt(t, 10) || null : null)}
            keyboardType="number-pad"
            placeholder="50"
            style={{ width: 72, textAlign: "right" }}
          />
          <Text style={s.mute}>lb</Text>
        </Card>
      )}
    </Screen>
  );
}
