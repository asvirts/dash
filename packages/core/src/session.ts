import { adaptWorkout, prescribe, type Adapted } from "./adapt";
import type { GymInventory } from "./equipment";
import { EXERCISE_BY_ID } from "./exercises";
import type { Gym, Routine, Session, SessionEntry, SetLog } from "./types";
import { uuid } from "./uuid";

export const now = () => new Date().toISOString();

function toInventory(gym: Gym | null): GymInventory {
  return gym ? { items: gym.items, maxDumbbellLbs: gym.maxDumbbellLbs } : { items: [], maxDumbbellLbs: null };
}

function entryFromAdapted(a: Adapted, inv: GymInventory, prevSets?: SetLog[]): SessionEntry {
  const opt = a.options[a.pick];
  const rx = prescribe(a, inv);
  const repsNum = parseInt(rx.reps, 10);
  const sets: SetLog[] = Array.from({ length: rx.sets }, (_, i) => ({
    reps: prevSets?.[i]?.reps ?? (Number.isFinite(repsNum) ? repsNum : null),
    weight: prevSets?.[i]?.weight ?? null,
    done: prevSets?.[i]?.done ?? false,
  }));
  return {
    uid: a.original.uid,
    original: a.original,
    options: a.options.map((o) => ({ exerciseId: o.exercise.id, match: o.match })),
    pick: a.pick,
    exerciseId: opt?.exercise.id ?? null,
    exerciseName: opt?.exercise.name ?? a.original.rawName,
    match: opt?.match ?? null,
    targetReps: rx.reps,
    loadHint: rx.loadHint,
    cues: rx.cues,
    sets,
  };
}

function toAdapted(e: SessionEntry): Adapted {
  const originalExercise = e.original.exerciseId ? EXERCISE_BY_ID[e.original.exerciseId] ?? null : null;
  const options = e.options
    .filter((o) => EXERCISE_BY_ID[o.exerciseId])
    .map((o) => ({ exercise: EXERCISE_BY_ID[o.exerciseId], match: o.match }));
  const status = !originalExercise ? "unknown" : options[0]?.exercise.id === originalExercise.id ? "kept" : options.length ? "swapped" : "none";
  return { original: e.original, originalExercise, options, pick: e.pick, status };
}

/** Build a new session for a routine at a gym, adapting exercises to the equipment. */
export function startSession(routine: Routine, gym: Gym | null): Session {
  const inv = toInventory(gym);
  return {
    id: uuid(),
    routineId: routine.id,
    routineName: routine.name,
    gymId: gym?.id ?? null,
    gymName: gym?.name ?? "No equipment",
    startedAt: now(),
    finishedAt: null,
    entries: adaptWorkout(routine.exercises, inv).map((a) => entryFromAdapted(a, inv)),
  };
}

/** Swap an entry to a different option. Logged sets are dropped because they were for another exercise. */
export function repick(entry: SessionEntry, pick: number, gym: Gym | null): SessionEntry {
  return entryFromAdapted({ ...toAdapted(entry), pick }, toInventory(gym));
}

export function isSwapped(e: SessionEntry) {
  return !!e.exerciseId && e.exerciseId !== e.original.exerciseId;
}

export function sessionStats(s: Session) {
  let sets = 0;
  let done = 0;
  let volume = 0;
  for (const e of s.entries)
    for (const set of e.sets) {
      sets++;
      if (set.done) {
        done++;
        volume += (set.reps ?? 0) * (set.weight ?? 0);
      }
    }
  const scored = s.entries.filter((e) => e.match != null);
  const avgMatch = scored.length ? Math.round(scored.reduce((n, e) => n + (e.match ?? 0), 0) / scored.length) : 0;
  const swaps = s.entries.filter(isSwapped).length;
  const intact = scored.length === s.entries.length && scored.every((e) => (e.match ?? 0) >= 70);
  return { sets, done, volume, avgMatch, swaps, intact };
}

/** Most recent completed sets for an exercise, for "last time" hints. */
export function lastPerformance(sessions: Session[], exerciseId: string, excludeSessionId?: string) {
  const sorted = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  for (const s of sorted) {
    if (s.id === excludeSessionId) continue;
    const e = s.entries.find((x) => x.exerciseId === exerciseId);
    const done = e?.sets.filter((x) => x.done);
    if (done?.length) return { date: s.startedAt, gymName: s.gymName, sets: done };
  }
  return null;
}

export function formatSets(sets: SetLog[]) {
  return sets.map((s) => `${s.weight ?? "BW"}×${s.reps ?? "?"}`).join(", ");
}
