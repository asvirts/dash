import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createLocalStore,
  createSupabaseStore,
  seedIfEmpty,
  type Collections,
  type Gym,
  type Kind,
  type Routine,
  type Session,
  type Store,
} from "@anygym/core";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert } from "react-native";
import { supabase } from "./supabase";

const localStore = createLocalStore(AsyncStorage);
const CURRENT_GYM_KEY = "anygym.currentGymId";

type Data = {
  ready: boolean;
  mode: "guest" | "cloud";
  cloudAvailable: boolean;
  email: string | null;
  routines: Routine[];
  gyms: Gym[];
  sessions: Session[];
  currentGymId: string | null;
  setCurrentGymId: (id: string) => void;
  upsert: <K extends Kind>(kind: K, item: Collections[K]) => Promise<void>;
  remove: (kind: Kind, id: string) => Promise<void>;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<string>;
  signOut: () => Promise<void>;
  accessToken: () => Promise<string | null>;
};

const Ctx = createContext<Data | null>(null);

export function useData() {
  const d = useContext(Ctx);
  if (!d) throw new Error("useData must be used inside <DataProvider>");
  return d;
}

const byName = (a: Routine | Gym, b: Routine | Gym) =>
  ("kind" in a && "kind" in b && a.kind !== b.kind ? (a.kind === "home" ? -1 : 1) : 0) || a.name.localeCompare(b.name);
const byStart = (a: Session, b: Session) => b.startedAt.localeCompare(a.startedAt);

/** Copy guest data into a fresh cloud account so nothing is lost on first sign-in. */
async function migrateGuestData(cloud: Store) {
  const [cr, cs] = await Promise.all([cloud.list("routines"), cloud.list("sessions")]);
  if (cr.length || cs.length) return;
  for (const kind of ["routines", "gyms", "sessions"] as const) {
    for (const item of await localStore.list(kind)) await cloud.upsert(kind, item);
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentGymId, setGymId] = useState<string | null>(null);
  const storeRef = useRef<Store>(localStore);

  const load = useCallback(async (store: Store) => {
    storeRef.current = store;
    await seedIfEmpty(store);
    const [r, g, s, cur] = await Promise.all([
      store.list("routines"),
      store.list("gyms"),
      store.list("sessions"),
      AsyncStorage.getItem(CURRENT_GYM_KEY),
    ]);
    setRoutines(r.sort(byName));
    setGyms(g.sort(byName));
    setSessions(s.sort(byStart));
    setGymId(cur && g.some((x) => x.id === cur) ? cur : (g.find((x) => x.kind === "home") ?? g[0])?.id ?? null);
  }, []);

  useEffect(() => {
    let alive = true;
    async function init() {
      try {
        const session = supabase ? (await supabase.auth.getSession()).data.session : null;
        if (!alive) return;
        setEmail(session?.user.email ?? null);
        await load(session && supabase ? createSupabaseStore(supabase) : localStore);
      } catch (e) {
        Alert.alert("Couldn't load your data", e instanceof Error ? e.message : String(e));
        await load(localStore);
      } finally {
        if (alive) setReady(true);
      }
    }
    init();
    return () => {
      alive = false;
    };
  }, [load]);

  const upsert = useCallback(async <K extends Kind>(kind: K, item: Collections[K]) => {
    const put = <T extends { id: string }>(list: T[], x: T) => {
      const i = list.findIndex((y) => y.id === x.id);
      return i >= 0 ? list.map((y) => (y.id === x.id ? x : y)) : [...list, x];
    };
    if (kind === "routines") setRoutines((l) => put(l, item as Routine).sort(byName));
    if (kind === "gyms") setGyms((l) => put(l, item as Gym).sort(byName));
    if (kind === "sessions") setSessions((l) => put(l, item as Session).sort(byStart));
    try {
      await storeRef.current.upsert(kind, item);
    } catch (e) {
      Alert.alert("Couldn't save", e instanceof Error ? e.message : String(e));
    }
  }, []);

  const remove = useCallback(async (kind: Kind, id: string) => {
    if (kind === "routines") setRoutines((l) => l.filter((x) => x.id !== id));
    if (kind === "gyms") setGyms((l) => l.filter((x) => x.id !== id));
    if (kind === "sessions") setSessions((l) => l.filter((x) => x.id !== id));
    try {
      await storeRef.current.remove(kind, id);
    } catch (e) {
      Alert.alert("Couldn't delete", e instanceof Error ? e.message : String(e));
    }
  }, []);

  const value = useMemo<Data>(
    () => ({
      ready,
      mode: email ? "cloud" : "guest",
      cloudAvailable: !!supabase,
      email,
      routines,
      gyms,
      sessions,
      currentGymId,
      setCurrentGymId: (id) => {
        setGymId(id);
        AsyncStorage.setItem(CURRENT_GYM_KEY, id);
      },
      upsert,
      remove,
      refresh: () => load(storeRef.current),
      async signIn(e, password) {
        if (!supabase) throw new Error("Cloud sync isn't configured.");
        const { data, error } = await supabase.auth.signInWithPassword({ email: e.trim(), password });
        if (error) throw error;
        const cloud = createSupabaseStore(supabase);
        await migrateGuestData(cloud);
        setEmail(data.user.email ?? e);
        await load(cloud);
      },
      async signUp(e, password) {
        if (!supabase) throw new Error("Cloud sync isn't configured.");
        const { data, error } = await supabase.auth.signUp({ email: e.trim(), password });
        if (error) throw error;
        if (!data.session) return "Check your email to confirm your account, then sign in.";
        const cloud = createSupabaseStore(supabase);
        await migrateGuestData(cloud);
        setEmail(data.user?.email ?? e);
        await load(cloud);
        return "Account created. Your data now syncs.";
      },
      async signOut() {
        await supabase?.auth.signOut();
        setEmail(null);
        await load(localStore);
      },
      async accessToken() {
        return supabase ? ((await supabase.auth.getSession()).data.session?.access_token ?? null) : null;
      },
    }),
    [ready, email, routines, gyms, sessions, currentGymId, upsert, remove, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
