"use client";

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
} from "@reprelay/core";
import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

const localKV = {
  getItem: async (k: string) => localStorage.getItem(k),
  setItem: async (k: string, v: string) => localStorage.setItem(k, v),
};

type Data = {
  ready: boolean;
  user: User | null;
  routines: Routine[];
  gyms: Gym[];
  sessions: Session[];
  currentGym: Gym | null;
  setCurrentGymId: (id: string) => void;
  upsert: <K extends Kind>(kind: K, item: Collections[K]) => Promise<void>;
  remove: (kind: Kind, id: string) => Promise<void>;
  accessToken: () => Promise<string | null>;
};

const Ctx = createContext<Data | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentGymId, setCurrentGymIdState] = useState<string | null>(null);

  const store: Store = useMemo(
    () => (user && supabase ? createSupabaseStore(supabase) : createLocalStore(localKV)),
    [user],
  );

  // Auth state.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  // Load data whenever the backing store changes (guest ↔ signed in).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await seedIfEmpty(store);
        const [r, g, s] = await Promise.all([store.list("routines"), store.list("gyms"), store.list("sessions")]);
        if (cancelled) return;
        setRoutines(r.sort((a, b) => a.name.localeCompare(b.name)));
        setGyms(g);
        setSessions(s.sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
        setCurrentGymIdState(localStorage.getItem("reprelay.currentGym"));
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const upsert = useCallback(
    async <K extends Kind>(kind: K, item: Collections[K]) => {
      const apply = <T extends { id: string }>(list: T[]) => {
        const i = list.findIndex((x) => x.id === item.id);
        return i >= 0 ? list.map((x, j) => (j === i ? (item as unknown as T) : x)) : [item as unknown as T, ...list];
      };
      if (kind === "routines") setRoutines(apply);
      if (kind === "gyms") setGyms(apply);
      if (kind === "sessions") setSessions(apply);
      await store.upsert(kind, item);
    },
    [store],
  );

  const remove = useCallback(
    async (kind: Kind, id: string) => {
      if (kind === "routines") setRoutines((l) => l.filter((x) => x.id !== id));
      if (kind === "gyms") setGyms((l) => l.filter((x) => x.id !== id));
      if (kind === "sessions") setSessions((l) => l.filter((x) => x.id !== id));
      await store.remove(kind, id);
    },
    [store],
  );

  const setCurrentGymId = useCallback((id: string) => {
    localStorage.setItem("reprelay.currentGym", id);
    setCurrentGymIdState(id);
  }, []);

  const currentGym = gyms.find((g) => g.id === currentGymId) ?? gyms.find((g) => g.kind === "home") ?? gyms[0] ?? null;

  const accessToken = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  return (
    <Ctx.Provider
      value={{ ready, user, routines, gyms, sessions, currentGym, setCurrentGymId, upsert, remove, accessToken }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useData() {
  const d = useContext(Ctx);
  if (!d) throw new Error("useData outside DataProvider");
  return d;
}
