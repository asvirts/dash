import type { EquipmentId, GymInventory } from "./equipment";
import { EXERCISES, EXERCISE_BY_ID, RELATED_PATTERNS, type Exercise } from "./exercises";

export type Prescribed = {
  uid: string;
  rawName: string;
  exerciseId: string | null;
  sets: number;
  reps: string; // "5", "8-10", "30s"
  loadLbs: number | null;
  rpe?: string;
};

export type Option = { exercise: Exercise; match: number };

export type Adapted = {
  original: Prescribed;
  originalExercise: Exercise | null;
  status: "kept" | "swapped" | "none" | "unknown";
  options: Option[]; // ranked; options[0] is the default pick
  pick: number;
};

export type Prescription = {
  sets: number;
  reps: string;
  loadHint: string | null;
  cues: string[];
};

export function isAvailable(ex: Exercise, items: EquipmentId[]) {
  const have = new Set(items);
  return ex.requires.every((r) => {
    if (have.has(r)) return true;
    // An adjustable bench works as a flat bench too.
    if (r === "flat_bench" && have.has("bench")) return true;
    return false;
  });
}

function jaccard<T>(a: T[], b: T[]) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

/** Rough per-hand dumbbell weight that would match a barbell/machine load. */
export function dumbbellEquivalent(orig: Exercise, loadLbs: number) {
  if (orig.dbLimited || orig.requires.includes("dumbbells")) return loadLbs;
  const factor: Record<string, number> = {
    squat: 0.35,
    hinge: 0.4,
    lunge: 0.3,
    h_push: 0.4,
    v_push: 0.4,
    h_pull: 0.45,
  };
  return Math.round((loadLbs * (factor[orig.pattern] ?? 0.4)) / 5) * 5;
}

const FREE: EquipmentId[] = ["barbell", "dumbbells", "kettlebell"];
const isFreeWeight = (e: Exercise) => e.requires.some((r) => FREE.includes(r));

export function scoreSwap(orig: Exercise, cand: Exercise, inv: GymInventory, loadLbs: number | null) {
  let s = cand.pattern === orig.pattern ? 70 : RELATED_PATTERNS[orig.pattern]?.includes(cand.pattern) ? 38 : 0;
  if (!s) return 0;
  s += 15 * jaccard(orig.muscles, cand.muscles);
  s += Math.max(0, 14 - 7 * Math.abs(orig.load - cand.load));
  if (!!orig.unilateral !== !!cand.unilateral) s -= 3;
  if (isFreeWeight(orig) === isFreeWeight(cand)) s += 5;
  if (cand.dbLimited && inv.maxDumbbellLbs && loadLbs) {
    const need = dumbbellEquivalent(orig, loadLbs);
    // A light rack still beats bodyweight, so keep this penalty small.
    if (need > inv.maxDumbbellLbs) s -= Math.min(5, ((need - inv.maxDumbbellLbs) / need) * 10);
  }
  return Math.max(1, Math.min(98, Math.round(s)));
}

export function adaptWorkout(workout: Prescribed[], inv: GymInventory): Adapted[] {
  const available = EXERCISES.filter((e) => isAvailable(e, inv.items));
  return workout.map((p) => {
    const orig = p.exerciseId ? EXERCISE_BY_ID[p.exerciseId] : null;
    if (!orig) return { original: p, originalExercise: null, status: "unknown", options: [], pick: 0 };

    const options: Option[] = available
      .filter((e) => e.id !== orig.id)
      .map((e) => ({ exercise: e, match: scoreSwap(orig, e, inv, p.loadLbs) }))
      .filter((o) => o.match > 0)
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);

    if (isAvailable(orig, inv.items)) {
      return { original: p, originalExercise: orig, status: "kept", options: [{ exercise: orig, match: 100 }, ...options], pick: 0 };
    }
    return { original: p, originalExercise: orig, status: options.length ? "swapped" : "none", options, pick: 0 };
  });
}

function parseReps(reps: string): [number, number] | null {
  const m = reps.match(/^(\d+)\s*(?:[-–]\s*(\d+))?$/);
  if (!m) return null;
  const lo = +m[1];
  return [lo, m[2] ? +m[2] : lo];
}

/** Adjust sets/reps/cues so the swap keeps the original training effect. */
export function prescribe(a: Adapted, inv: GymInventory): Prescription {
  const p = a.original;
  const opt = a.options[a.pick];
  const orig = a.originalExercise;
  const base: Prescription = { sets: p.sets, reps: p.reps, loadHint: p.loadLbs ? `${p.loadLbs} lb` : null, cues: [] };
  if (!opt || !orig) return base;
  const ex = opt.exercise;
  if (ex.id === orig.id) return base;

  const cues: string[] = [];
  const range = parseReps(p.reps);
  let lo = range?.[0] ?? 0;
  let hi = range?.[1] ?? 0;

  let levelDrop = orig.load - ex.load;
  let loadHint: string | null = null;

  if (ex.dbLimited && p.loadLbs) {
    const need = dumbbellEquivalent(orig, p.loadLbs);
    const max = inv.maxDumbbellLbs;
    if (max && need > max) {
      loadHint = `${max} lb (heaviest DB)`;
      levelDrop = Math.max(levelDrop, need / max > 1.5 ? 2 : 1);
      cues.push(`Heaviest DB is ${max} lb vs ~${need} lb needed. Use a 3–4s lowering phase to make up for it.`);
    } else {
      loadHint = `~${need} lb ${ex.requires.includes("kettlebell") ? "KB" : "DBs"}`;
    }
  } else if (p.loadLbs && ex.load === orig.load && ex.requires.includes("smith_machine")) {
    loadHint = `~${Math.round((p.loadLbs * 0.85) / 5) * 5} lb (Smith feels heavier)`;
  }

  if (levelDrop > 0 && range) {
    const mult = levelDrop === 1 ? 1.5 : 2.2;
    lo = Math.min(25, Math.round(lo * mult));
    hi = Math.min(30, Math.round(hi * mult));
    cues.push("Lighter load, so add reps. Finish each set 1–2 reps short of failure (RPE 8–9).");
    if (ex.load === 1) cues.push("Tempo 3-1-1 with a 1s pause at the bottom.");
  }
  if (ex.unilateral && !orig.unilateral) cues.push("Reps are per side.");
  if (ex.pattern !== orig.pattern) cues.push(`Closest option here trains a related pattern (${ex.name}).`);

  return {
    sets: p.sets,
    reps: range ? (lo === hi ? `${lo}` : `${lo}–${hi}`) : p.reps,
    loadHint,
    cues,
  };
}

export function summarize(adapted: Adapted[]) {
  const scored = adapted.filter((a) => a.options[a.pick]);
  const avg = scored.length ? Math.round(scored.reduce((s, a) => s + a.options[a.pick].match, 0) / scored.length) : 0;
  const swaps = adapted.filter((a) => a.options[a.pick] && a.options[a.pick].exercise.id !== a.originalExercise?.id).length;
  const sets = adapted.reduce((s, a) => s + a.original.sets, 0);
  const intact = scored.every((a) => a.options[a.pick].match >= 70) && scored.length === adapted.length;
  return { avg, swaps, sets, intact, count: adapted.length };
}
