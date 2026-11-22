import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { DataProvider, useData } from "@/lib/data";
import { C } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: C.lime, background: C.bg, card: C.bg, text: C.ink, border: C.line },
};

function Root() {
  const { ready } = useData();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.lime,
        headerTitleStyle: { color: C.ink },
        contentStyle: { backgroundColor: C.bg },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session/[id]" options={{ title: "Workout" }} />
      <Stack.Screen name="routine/[id]" options={{ title: "Routine" }} />
      <Stack.Screen name="gym/[id]" options={{ title: "Gym" }} />
      <Stack.Screen name="account" options={{ title: "Account", presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <DataProvider>
        <Root />
      </DataProvider>
    </ThemeProvider>
  );
}
