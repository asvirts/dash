import { NativeTabs } from "expo-router/native-tabs";
import { C } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <NativeTabs tintColor={C.lime} iconColor={C.mute} backgroundColor={C.bg} labelStyle={{ color: C.mute }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.mixed.cardio" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="routines">
        <NativeTabs.Trigger.Label>Routines</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet.rectangle" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="gyms">
        <NativeTabs.Trigger.Label>Gyms</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="dumbbell.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
