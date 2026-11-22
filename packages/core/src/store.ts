import type { SupabaseClient } from "@supabase/supabase-js";
import { EQUIPMENT_IDS } from "./equipment";
import type { Collections, Gym, Kind, Routine } from "./types";
import { uuid } from "./uuid";
import { parseWorkout, TEMPLATES } from "./workout";

/** Minimal async key-value storage: AsyncStorage on mobile, localStorage wrapper on web. */
export type KV = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export interface Store {
  list<K extends Kind>(kind: K): Promise<Collections[K][]>;
  upsert<K extends Kind>(kind: K, item: Collections[K]): Promise<void>;
  remove(kind: Kind, id: string): Promise<void>;
}

/** Guest mode: data lives on this device only. */
export function createLocalStore(kv: KV, prefix = "reprelay"): Store {
  const key = (k: Kind) => `${prefix}.${k}`;
  async function read<K extends Kind>(k: K): Promise<Collections[K][]> {
    try {
      return JSON.parse((await kv.getItem(key(k))) ?? "[]");
    } catch {
      return [];
    }
  }
  return {
    list: read,
    async upsert(k, item) {
      const all = await read(k);
      const i = all.findIndex((x) => x.id === item.id);
      if (i >= 0) all[i] = item;
      else all.push(item);
      await kv.setItem(key(k), JSON.stringify(all));
    },
    async remove(k, id) {
      await kv.setItem(key(k), JSON.stringify((await read(k)).filter((x) => x.id !== id)));
    },
  };
}

/** Signed-in mode: rows in Supabase tables `routines`, `gyms`, `sessions` (see supabase/migrations). */
export function createSupabaseStore(sb: SupabaseClient): Store {
  return {
    async list(kind) {
      const { data, error } = await sb.from(kind).select("data").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => r.data);
    },
    async upsert(kind, item) {
      const { error } = await sb.from(kind).upsert({ id: item.id, data: item, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async remove(kind, id) {
      const { error } = await sb.from(kind).delete().eq("id", id);
      if (error) throw error;
    },
  };
}

export function makeRoutine(name: string, text: string): Routine {
  return { id: uuid(), name, text, exercises: parseWorkout(text), updatedAt: new Date().toISOString() };
}

export function makeGym(partial: Partial<Gym> & Pick<Gym, "name">): Gym {
  return {
    id: uuid(),
    kind: "travel",
    items: [],
    maxDumbbellLbs: null,
    summary: null,
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

/** First run: starter routines + a fully equipped home gym. */
export async function seedIfEmpty(store: Store) {
  const [routines, gyms] = await Promise.all([store.list("routines"), store.list("gyms")]);
  if (!routines.length) for (const t of TEMPLATES) await store.upsert("routines", makeRoutine(t.name, t.text));
  if (!gyms.length)
    await store.upsert("gyms", makeGym({ name: "Home gym", kind: "home", items: [...EQUIPMENT_IDS], maxDumbbellLbs: 100 }));
}
