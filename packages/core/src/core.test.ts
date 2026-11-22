import { test } from "node:test";
import assert from "node:assert/strict";
import { EXERCISE_BY_ID, findExercise } from "./exercises";
import { parseWorkout } from "./workout";
import { makeGym, makeRoutine } from "./store";
import { lastPerformance, repick, sessionStats, startSession } from "./session";
import { EQUIPMENT_IDS } from "./equipment";

test("parses common workout lines", () => {
  const w = parseWorkout("1. Back squat 4x6 @ 225\nRDL – 3 x 8-10, 185lb\nPull-ups 4x8 RPE 8\nGoblet squat 3x12 20kg\nnot an exercise");
  assert.equal(w.length, 4);
  assert.deepEqual([w[0].exerciseId, w[0].sets, w[0].reps, w[0].loadLbs], ["bb_back_squat", 4, "6", 225]);
  assert.deepEqual([w[1].exerciseId, w[1].reps, w[1].loadLbs], ["bb_rdl", "8-10", 185]);
  assert.deepEqual([w[2].exerciseId, w[2].loadLbs, w[2].rpe], ["weighted_pullup", null, "RPE 8"]);
  assert.equal(w[3].loadLbs, 44);
});

test("matches names, aliases and plurals", () => {
  for (const [n, id] of [["Leg curl", "leg_curl"], ["Chin ups", "weighted_pullup"], ["Walking lunges", "db_reverse_lunge"], ["Rope pushdown", "cable_pushdown"]])
    assert.equal(findExercise(n)?.id, id, n);
});

test("home gym keeps every exercise", () => {
  const r = makeRoutine("Lower", "Back squat 4x5 @ 245\nRDL 3x8 @ 185\nLeg curl 3x12");
  const s = startSession(r, makeGym({ name: "Home", items: [...EQUIPMENT_IDS], maxDumbbellLbs: 100 }));
  assert.ok(s.entries.every((e) => e.match === 100 && e.exerciseId === e.original.exerciseId));
  assert.equal(sessionStats(s).swaps, 0);
});

test("dumbbell-only hotel gym swaps and scales reps", () => {
  const r = makeRoutine("Lower", "Back squat 4x5 @ 245\nRDL 3x8 @ 185");
  const s = startSession(r, makeGym({ name: "Hotel", items: ["dumbbells", "bench"], maxDumbbellLbs: 50 }));
  const [sq, rdl] = s.entries;
  assert.notEqual(sq.exerciseId, "bb_back_squat");
  assert.equal(rdl.exerciseId, "db_rdl");
  assert.ok(parseInt(rdl.targetReps) > 8, `reps scaled up: ${rdl.targetReps}`);
  assert.ok(rdl.cues.some((c) => c.includes("50 lb")));
  assert.equal(rdl.sets.length, 3);
});

test("repick and last performance", () => {
  const gym = makeGym({ name: "Hotel", items: ["dumbbells", "bench", "cable_machine"], maxDumbbellLbs: 50 });
  const s = startSession(makeRoutine("Pull", "Barbell row 4x8 @ 155"), gym);
  const e = repick(s.entries[0], 1, gym);
  assert.equal(e.pick, 1);
  assert.equal(e.exerciseId, s.entries[0].options[1].exerciseId);
  e.sets[0] = { reps: 10, weight: 50, done: true };
  s.entries[0] = e;
  assert.equal(lastPerformance([s], e.exerciseId!)?.sets[0].weight, 50);
  assert.equal(sessionStats(s).volume, 500);
});

test("light dumbbells still beat bodyweight", () => {
  const s = startSession(makeRoutine("Legs", "Back squat 4x5 @ 245"), makeGym({ name: "Hotel", items: ["dumbbells", "bench"], maxDumbbellLbs: 50 }));
  assert.ok(EXERCISE_BY_ID[s.entries[0].exerciseId!].requires.includes("dumbbells"), s.entries[0].exerciseName);
});
