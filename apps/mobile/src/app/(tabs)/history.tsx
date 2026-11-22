import { sessionStats } from "@anygym/core";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { Card, Empty, Screen, Title, s } from "@/components/ui";
import { useData } from "@/lib/data";
import { C } from "@/lib/theme";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export default function History() {
  const { sessions } = useData();
  const done = sessions.filter((x) => x.finishedAt);
  const travel = done.filter((x) => sessionStats(x).swaps > 0).length;
  return (
    <Screen>
      <Title sub={done.length ? `${done.length} workouts · ${travel} adapted on the road` : undefined}>History</Title>
      {done.map((x) => {
        const st = sessionStats(x);
        return (
          <Card key={x.id} onPress={() => router.push(`/session/${x.id}`)}>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Text style={s.h2}>{x.routineName}</Text>
              <Text style={s.mute}>{fmtDate(x.startedAt)}</Text>
            </View>
            <Text style={[s.mute, { marginTop: 4 }]}>
              {x.gymName} · {st.done}/{st.sets} sets
              {st.volume ? ` · ${st.volume.toLocaleString()} lb volume` : ""}
            </Text>
            {st.swaps > 0 && (
              <Text style={{ color: C.amber, fontSize: 13, marginTop: 4 }}>
                {st.swaps} swap{st.swaps === 1 ? "" : "s"} · {st.avgMatch}% match
              </Text>
            )}
          </Card>
        );
      })}
      {!done.length && <Empty>Finished workouts show up here.</Empty>}
    </Screen>
  );
}
