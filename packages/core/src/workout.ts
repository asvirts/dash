import type { Prescribed } from "./adapt";
import { findExercise } from "./exercises";

const UNIT = String.raw`(seconds?|secs?|s|minutes?|mins?|min|miles?|mi|km|k)\b`;

function unit(u: string | undefined) {
  if (!u) return "";
  const x = u.toLowerCase();
  if (x.startsWith("s")) return "s";
  if (x.startsWith("min")) return " min";
  if (x.startsWith("mi")) return " mi";
  return " km";
}

/** "reps" for "8-10", "time" for "30s" / "20 min", "distance" for "2 mi" / "5 km". */
export function repsKind(reps: string): "reps" | "time" | "distance" {
  if (/\d\s*(s|min)$/.test(reps)) return "time";
  if (/\d\s*(mi|km)$/.test(reps)) return "distance";
  return "reps";
}

/** "3×10", "3×30s", or just "20 min" for a single timed block. */
export function formatTarget(sets: number, reps: string) {
  return sets === 1 && repsKind(reps) !== "reps" ? reps : `${sets}×${reps}`;
}

/**
 * Parse a pasted workout, one exercise per line, e.g.
 *   "Squats 3x12"
 *   "Push-ups 3 sets of 10"
 *   "Plank 3x30s"
 *   "Walk 20 min" / "Run 5k"
 *   "1. Back squat 4x6 @ 225", "RDL – 3 x 8-10, 185lb", "Pull-ups 4x8 RPE 8"
 */
export function parseWorkout(text: string): Prescribed[] {
  const out: Prescribed[] = [];
  const lines = text.split(/\n+/);
  const setsReps = new RegExp(String.raw`(\d+)\s*(?:[x×*]|sets?\s+of)\s*(\d+(?:\s*[-–]\s*\d+)?|AMRAP)(?:\s*${UNIT})?`, "i");
  const single = new RegExp(String.raw`(\d+(?:\.\d+)?(?:\s*[-–]\s*\d+)?)\s*${UNIT}`, "i");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replace(/^\s*(?:[A-Z]?\d+[.)]|[-•*])\s*/, "").trim();
    if (!line) continue;
    let sets: number;
    let reps: string;
    let m = line.match(setsReps);
    if (m) {
      sets = +m[1];
      reps = m[2].replace(/\s+/g, "") + unit(m[3]);
    } else {
      m = line.match(single);
      if (!m) continue;
      sets = 1;
      reps = m[1].replace(/\s+/g, "") + unit(m[2]);
    }
    const before = line.slice(0, m.index).replace(/[-–:,@(]+\s*$/, "").trim();
    const rest = line.slice((m.index ?? 0) + m[0].length);
    // "5k run": the name comes after the number.
    const name = before || rest.replace(/^[\s\-–:,]+/, "").split(/[@,(]/)[0].trim();
    let loadLbs: number | null = null;
    let rpe: RegExpMatchArray | null = null;
    if (repsKind(reps) === "reps") {
      const kg = rest.match(/(\d+(?:\.\d+)?)\s*kg/i);
      const lb = rest.match(/@?\s*(\d{2,4})\s*(?:lb|lbs|#)?\b/i);
      rpe = rest.match(/(RPE|RIR)\s*(\d+(?:\.\d)?)/i);
      if (kg) loadLbs = Math.round(parseFloat(kg[1]) * 2.2046);
      else if (lb && !/^(RPE|RIR)/i.test(rest.trim()) && +lb[1] >= 10) loadLbs = +lb[1];
    }
    out.push({
      uid: `${i}:${line}`,
      rawName: name || line,
      exerciseId: findExercise(name)?.id ?? null,
      sets,
      reps,
      loadLbs,
      rpe: rpe ? `${rpe[1].toUpperCase()} ${rpe[2]}` : undefined,
    });
  }
  return out;
}

export const TEMPLATES: { name: string; text: string }[] = [
  {
    name: "Full Body",
    text: `Squats 3x12
Push-ups 3x10
Dumbbell row 3x10
Glute bridges 3x15
Plank 3x30s`,
  },
  {
    name: "Cardio + Core",
    text: `Treadmill 20 min
Bicycle crunches 3x20
Side plank 2x30s
Dead bug 3x10`,
  },
  {
    name: "Quick 20 (no equipment)",
    text: `Jumping jacks 1 min
Squats 3x15
Push-ups 3x10
Lunges 3x10
Mountain climbers 3x30s
Stretching 5 min`,
  },
  {
    name: "Dumbbell Strength",
    text: `Goblet squat 3x10
Dumbbell bench press 3x10
One arm row 3x10
Shoulder press 3x10
Dumbbell RDL 3x10`,
  },
];

export function toText(w: Prescribed[]) {
  return w
    .map((p) => `${p.rawName} ${formatTarget(p.sets, p.reps).replace("×", "x")}${p.loadLbs ? ` @ ${p.loadLbs}` : ""}${p.rpe ? ` ${p.rpe}` : ""}`)
    .join("\n");
}
