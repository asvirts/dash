import type { Prescribed } from "./adapt";
import { findExercise } from "./exercises";

/**
 * Parse a pasted workout, one exercise per line, e.g.
 *   "1. Back squat 4x6 @ 225"
 *   "RDL – 3 x 8-10, 185lb"
 *   "Pull-ups 4x8 RPE 8"
 */
export function parseWorkout(text: string): Prescribed[] {
  const out: Prescribed[] = [];
  const lines = text.split(/\n+/);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replace(/^\s*(?:[A-Z]?\d+[.)]|[-•*])\s*/, "").trim();
    if (!line) continue;
    const sr = line.match(/(\d+)\s*[x×*]\s*(\d+(?:\s*[-–]\s*\d+)?|AMRAP)/i);
    if (!sr) continue;
    const name = line.slice(0, sr.index).replace(/[-–:,@(]+\s*$/, "").trim();
    const rest = line.slice((sr.index ?? 0) + sr[0].length);
    const kg = rest.match(/(\d+(?:\.\d+)?)\s*kg/i);
    const lb = rest.match(/@?\s*(\d{2,4})\s*(?:lb|lbs|#)?\b/i);
    const rpe = rest.match(/(RPE|RIR)\s*(\d+(?:\.\d)?)/i);
    let loadLbs: number | null = null;
    if (kg) loadLbs = Math.round(parseFloat(kg[1]) * 2.2046);
    else if (lb && !/^(RPE|RIR)/i.test(rest.trim()) && +lb[1] >= 10) loadLbs = +lb[1];
    out.push({
      uid: `${i}:${line}`,
      rawName: name || line,
      exerciseId: findExercise(name)?.id ?? null,
      sets: +sr[1],
      reps: sr[2].replace(/\s+/g, ""),
      loadLbs,
      rpe: rpe ? `${rpe[1].toUpperCase()} ${rpe[2]}` : undefined,
    });
  }
  return out;
}

export const TEMPLATES: { name: string; text: string }[] = [
  {
    name: "Lower Strength",
    text: `Back squat 4x5 @ 245
Romanian deadlift 3x8 @ 185
Bulgarian split squat 3x8
Leg curl 3x12
Calf raise 3x12`,
  },
  {
    name: "Upper Push",
    text: `Bench press 4x6 @ 185
Overhead press 3x8 @ 105
Incline DB press 3x10 @ 55
Dips 3x10
Tricep pushdown 3x12`,
  },
  {
    name: "Upper Pull",
    text: `Weighted pull up 4x6
Barbell row 4x8 @ 155
Lat pulldown 3x10
Face pull 3x15
Barbell curl 3x10 @ 65`,
  },
  {
    name: "Full Body",
    text: `Trap bar deadlift 4x5 @ 275
Bench press 3x6 @ 175
Front squat 3x6 @ 155
Seated cable row 3x10
Hanging leg raise 3x12`,
  },
];

export function toText(w: Prescribed[]) {
  return w
    .map((p) => `${p.rawName} ${p.sets}x${p.reps}${p.loadLbs ? ` @ ${p.loadLbs}` : ""}${p.rpe ? ` ${p.rpe}` : ""}`)
    .join("\n");
}
