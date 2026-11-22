import { router } from "expo-router";
import { Text } from "react-native";
import { Button, Card, Empty, Screen, Title, s } from "@/components/ui";
import { useData } from "@/lib/data";

export default function Routines() {
  const { routines } = useData();
  return (
    <Screen footer={<Button title="+ New routine" onPress={() => router.push("/routine/new")} />}>
      <Title sub="Your regular workouts. They're adapted automatically when you train somewhere else.">Routines</Title>
      {routines.map((r) => (
        <Card key={r.id} onPress={() => router.push(`/routine/${r.id}`)}>
          <Text style={s.h2}>{r.name}</Text>
          <Text style={[s.mute, { marginTop: 4 }]}>
            {r.exercises.length} exercises · {r.exercises.reduce((n, e) => n + e.sets, 0)} sets
          </Text>
          <Text style={[s.mute, { marginTop: 2 }]} numberOfLines={2}>
            {r.exercises.map((e) => e.rawName).join(" · ")}
          </Text>
        </Card>
      ))}
      {!routines.length && <Empty>No routines yet.</Empty>}
    </Screen>
  );
}
