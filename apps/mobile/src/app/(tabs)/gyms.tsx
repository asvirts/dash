import { equipmentLabel } from "@reprelay/core";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Button, Card, Empty, Screen, Title, s } from "@/components/ui";
import { useData } from "@/lib/data";
import { C } from "@/lib/theme";

export default function Gyms() {
  const { gyms, currentGymId, setCurrentGymId } = useData();
  return (
    <Screen footer={<Button title="📷 Scan a gym" onPress={() => router.push("/gym/new?scan=1")} />}>
      <Title sub="Snap a photo or video of any gym. RepRelay remembers what's there.">Gyms</Title>
      {gyms.map((g) => {
        const current = g.id === currentGymId;
        return (
          <Card key={g.id} onPress={() => router.push(`/gym/${g.id}`)} style={current ? { borderColor: C.lime } : null}>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Text style={s.h2}>
                {g.kind === "home" ? "🏠" : "🧳"} {g.name}
              </Text>
              {current ? (
                <Text style={{ color: C.lime, fontSize: 13, fontWeight: "600" }}>Training here</Text>
              ) : (
                <Pressable onPress={() => setCurrentGymId(g.id)} hitSlop={10}>
                  <Text style={{ color: C.mute, fontSize: 13 }}>Use here</Text>
                </Pressable>
              )}
            </View>
            <Text style={[s.mute, { marginTop: 4 }]} numberOfLines={2}>
              {g.items.length ? g.items.map(equipmentLabel).join(" · ") : "Bodyweight only"}
            </Text>
            {g.maxDumbbellLbs ? <Text style={[s.mute, { marginTop: 2 }]}>Dumbbells up to {g.maxDumbbellLbs} lb</Text> : null}
          </Card>
        );
      })}
      {!gyms.length && <Empty>No gyms yet. Scan one to get started.</Empty>}
    </Screen>
  );
}
