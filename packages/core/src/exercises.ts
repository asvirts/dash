import type { EquipmentId } from "./equipment";

export type Pattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "h_push"
  | "v_push"
  | "h_pull"
  | "v_pull"
  | "knee_flex"
  | "knee_ext"
  | "biceps"
  | "triceps"
  | "delts"
  | "core"
  | "calves"
  | "carry"
  | "cardio"
  | "mobility";

export type Muscle =
  | "quads"
  | "glutes"
  | "hamstrings"
  | "adductors"
  | "lower_back"
  | "chest"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "triceps"
  | "lats"
  | "upper_back"
  | "biceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "calves"
  | "traps"
  | "heart";

export type Exercise = {
  id: string;
  name: string;
  pattern: Pattern;
  muscles: Muscle[];
  /** All of these must be present. Empty = bodyweight. */
  requires: EquipmentId[];
  /** 3 = heavy/axial (barbell, smith, leg press), 2 = moderate, 1 = light. For cardio: intensity. */
  load: 1 | 2 | 3;
  unilateral?: boolean;
  /** Load is capped by the heaviest dumbbell / kettlebell on hand. */
  dbLimited?: boolean;
  aliases?: string[];
};

const E = (e: Exercise) => e;

export const EXERCISES: Exercise[] = [
  // ── Squat ──
  E({ id: "bb_back_squat", name: "Barbell Back Squat", pattern: "squat", muscles: ["quads", "glutes", "adductors"], requires: ["barbell", "squat_rack"], load: 3, aliases: ["back squat", "bb squat", "high bar squat", "low bar squat"] }),
  E({ id: "bb_front_squat", name: "Barbell Front Squat", pattern: "squat", muscles: ["quads", "glutes"], requires: ["barbell", "squat_rack"], load: 3, aliases: ["front squat"] }),
  E({ id: "smith_squat", name: "Smith Machine Squat", pattern: "squat", muscles: ["quads", "glutes", "adductors"], requires: ["smith_machine"], load: 3, aliases: ["smith squat"] }),
  E({ id: "leg_press", name: "Leg Press", pattern: "squat", muscles: ["quads", "glutes", "adductors"], requires: ["leg_press"], load: 3 }),
  E({ id: "db_goblet_squat", name: "Goblet Squat (DB)", pattern: "squat", muscles: ["quads", "glutes"], requires: ["dumbbells"], load: 2, dbLimited: true, aliases: ["goblet squat"] }),
  E({ id: "kb_goblet_squat", name: "Goblet Squat (KB)", pattern: "squat", muscles: ["quads", "glutes"], requires: ["kettlebell"], load: 2, dbLimited: true }),
  E({ id: "heel_elev_db_squat", name: "Heels-Elevated DB Squat", pattern: "squat", muscles: ["quads", "glutes"], requires: ["dumbbells"], load: 2, dbLimited: true }),
  E({ id: "bw_tempo_squat", name: "Bodyweight Squat", pattern: "squat", muscles: ["quads", "glutes"], requires: [], load: 1, aliases: ["air squat", "bodyweight squat", "squat"] }),

  // ── Hinge ──
  E({ id: "bb_deadlift", name: "Barbell Deadlift", pattern: "hinge", muscles: ["hamstrings", "glutes", "lower_back", "upper_back"], requires: ["barbell"], load: 3, aliases: ["deadlift", "conventional deadlift", "dl"] }),
  E({ id: "trap_bar_deadlift", name: "Trap-Bar Deadlift", pattern: "hinge", muscles: ["glutes", "quads", "hamstrings", "lower_back"], requires: ["barbell"], load: 3, aliases: ["trap bar deadlift", "hex bar deadlift", "trap-bar dl"] }),
  E({ id: "bb_rdl", name: "Barbell Romanian Deadlift", pattern: "hinge", muscles: ["hamstrings", "glutes", "lower_back"], requires: ["barbell"], load: 3, aliases: ["rdl", "romanian deadlift", "bb rdl"] }),
  E({ id: "smith_rdl", name: "Smith Machine RDL", pattern: "hinge", muscles: ["hamstrings", "glutes", "lower_back"], requires: ["smith_machine"], load: 3, aliases: ["smith rdl"] }),
  E({ id: "db_rdl", name: "Dumbbell RDL", pattern: "hinge", muscles: ["hamstrings", "glutes", "lower_back"], requires: ["dumbbells"], load: 2, dbLimited: true, aliases: ["db rdl", "dumbbell romanian deadlift"] }),
  E({ id: "db_sl_rdl", name: "Single-Leg DB RDL", pattern: "hinge", muscles: ["hamstrings", "glutes"], requires: ["dumbbells"], load: 2, unilateral: true, dbLimited: true, aliases: ["single leg rdl"] }),
  E({ id: "kb_swing", name: "Kettlebell Swing", pattern: "hinge", muscles: ["glutes", "hamstrings"], requires: ["kettlebell"], load: 2, dbLimited: true, aliases: ["swing", "kb swing"] }),
  E({ id: "cable_pull_through", name: "Cable Pull-Through", pattern: "hinge", muscles: ["glutes", "hamstrings"], requires: ["cable_machine"], load: 2, aliases: ["pull through"] }),
  E({ id: "bb_hip_thrust", name: "Barbell Hip Thrust", pattern: "hinge", muscles: ["glutes", "hamstrings"], requires: ["barbell", "flat_bench"], load: 3, aliases: ["hip thrust"] }),
  E({ id: "db_hip_thrust", name: "DB Hip Thrust", pattern: "hinge", muscles: ["glutes", "hamstrings"], requires: ["dumbbells", "bench"], load: 2, dbLimited: true }),
  E({ id: "sl_glute_bridge", name: "Single-Leg Glute Bridge", pattern: "hinge", muscles: ["glutes", "hamstrings"], requires: [], load: 1, unilateral: true, aliases: ["single leg glute bridge"] }),
  E({ id: "glute_bridge", name: "Glute Bridge", pattern: "hinge", muscles: ["glutes", "hamstrings"], requires: [], load: 1, aliases: ["glute bridge", "bridge", "hip bridge"] }),

  // ── Lunge / single leg ──
  E({ id: "bb_split_squat", name: "Barbell Split Squat", pattern: "lunge", muscles: ["quads", "glutes", "adductors"], requires: ["barbell", "squat_rack"], load: 3, unilateral: true }),
  E({ id: "smith_split_squat", name: "Smith Split Squat", pattern: "lunge", muscles: ["quads", "glutes", "adductors"], requires: ["smith_machine"], load: 3, unilateral: true }),
  E({ id: "db_bulgarian", name: "DB Bulgarian Split Squat", pattern: "lunge", muscles: ["quads", "glutes", "adductors"], requires: ["dumbbells", "bench"], load: 2, unilateral: true, dbLimited: true, aliases: ["bulgarian split squat", "rfess", "rear foot elevated split squat", "bss"] }),
  E({ id: "db_reverse_lunge", name: "DB Reverse Lunge", pattern: "lunge", muscles: ["quads", "glutes"], requires: ["dumbbells"], load: 2, unilateral: true, dbLimited: true, aliases: ["reverse lunge", "walking lunge", "db lunge"] }),
  E({ id: "db_step_up", name: "DB Step-Up", pattern: "lunge", muscles: ["quads", "glutes"], requires: ["dumbbells", "step_box"], load: 2, unilateral: true, dbLimited: true, aliases: ["step up"] }),
  E({ id: "bw_lunge", name: "Bodyweight Lunge", pattern: "lunge", muscles: ["quads", "glutes"], requires: [], load: 1, unilateral: true, aliases: ["bodyweight lunge", "alternating lunge", "lunge"] }),
  E({ id: "bw_step_up", name: "Step-Up", pattern: "lunge", muscles: ["quads", "glutes"], requires: ["step_box"], load: 1, unilateral: true, aliases: ["bodyweight step up", "box step up"] }),
  E({ id: "bw_split_squat", name: "Bodyweight Split Squat", pattern: "lunge", muscles: ["quads", "glutes"], requires: [], load: 1, unilateral: true, aliases: ["split squat"] }),

  // ── Horizontal push ──
  E({ id: "bb_bench", name: "Barbell Bench Press", pattern: "h_push", muscles: ["chest", "front_delts", "triceps"], requires: ["barbell", "flat_bench"], load: 3, aliases: ["bench press", "bench", "flat bench"] }),
  E({ id: "smith_bench", name: "Smith Machine Bench Press", pattern: "h_push", muscles: ["chest", "front_delts", "triceps"], requires: ["smith_machine", "flat_bench"], load: 3, aliases: ["smith bench"] }),
  E({ id: "db_bench", name: "Dumbbell Bench Press", pattern: "h_push", muscles: ["chest", "front_delts", "triceps"], requires: ["dumbbells", "flat_bench"], load: 2, dbLimited: true, aliases: ["db bench", "db press"] }),
  E({ id: "db_incline_bench", name: "Incline DB Press", pattern: "h_push", muscles: ["chest", "front_delts", "triceps"], requires: ["dumbbells", "bench"], load: 2, dbLimited: true, aliases: ["incline press", "incline bench", "incline db press"] }),
  E({ id: "machine_chest_press", name: "Machine Chest Press", pattern: "h_push", muscles: ["chest", "front_delts", "triceps"], requires: ["chest_press"], load: 2, aliases: ["chest press"] }),
  E({ id: "cable_press", name: "Standing Cable Press", pattern: "h_push", muscles: ["chest", "front_delts", "triceps"], requires: ["cable_machine"], load: 2, aliases: ["cable fly", "cable chest press"] }),
  E({ id: "dips", name: "Dips", pattern: "h_push", muscles: ["chest", "triceps", "front_delts"], requires: ["dip_station"], load: 2, aliases: ["dip", "chest dip"] }),
  E({ id: "knee_pushup", name: "Knee Push-Up", pattern: "h_push", muscles: ["chest", "front_delts", "triceps"], requires: [], load: 1, aliases: ["knee push up", "modified push up", "incline push up", "wall push up"] }),
  E({ id: "pushup", name: "Push-Up", pattern: "h_push", muscles: ["chest", "front_delts", "triceps"], requires: [], load: 1, aliases: ["push up", "pushup", "push-up"] }),

  // ── Vertical push ──
  E({ id: "bb_ohp", name: "Barbell Overhead Press", pattern: "v_push", muscles: ["front_delts", "side_delts", "triceps"], requires: ["barbell"], load: 3, aliases: ["ohp", "overhead press", "military press", "press"] }),
  E({ id: "smith_ohp", name: "Smith Machine Overhead Press", pattern: "v_push", muscles: ["front_delts", "side_delts", "triceps"], requires: ["smith_machine", "bench"], load: 3 }),
  E({ id: "db_ohp", name: "Seated DB Shoulder Press", pattern: "v_push", muscles: ["front_delts", "side_delts", "triceps"], requires: ["dumbbells", "bench"], load: 2, dbLimited: true, aliases: ["db shoulder press", "shoulder press", "db ohp"] }),
  E({ id: "db_standing_ohp", name: "Standing DB Press", pattern: "v_push", muscles: ["front_delts", "side_delts", "triceps", "abs"], requires: ["dumbbells"], load: 2, dbLimited: true }),
  E({ id: "machine_shoulder_press", name: "Machine Shoulder Press", pattern: "v_push", muscles: ["front_delts", "side_delts", "triceps"], requires: ["shoulder_press"], load: 2 }),
  E({ id: "landmine_press", name: "Half-Kneeling Landmine Press", pattern: "v_push", muscles: ["front_delts", "chest", "triceps"], requires: ["barbell"], load: 2, unilateral: true, aliases: ["landmine press"] }),
  E({ id: "pike_pushup", name: "Pike Push-Up", pattern: "v_push", muscles: ["front_delts", "triceps"], requires: [], load: 1, aliases: ["pike push up"] }),

  // ── Horizontal pull ──
  E({ id: "bb_row", name: "Barbell Row", pattern: "h_pull", muscles: ["upper_back", "lats", "rear_delts", "biceps"], requires: ["barbell"], load: 3, aliases: ["bent over row", "bb row", "pendlay row"] }),
  E({ id: "chest_supported_row", name: "Chest-Supported DB Row", pattern: "h_pull", muscles: ["upper_back", "lats", "rear_delts", "biceps"], requires: ["dumbbells", "bench"], load: 2, dbLimited: true, aliases: ["chest supported row", "incline row", "seal row"] }),
  E({ id: "db_one_arm_row", name: "One-Arm DB Row", pattern: "h_pull", muscles: ["lats", "upper_back", "biceps"], requires: ["dumbbells", "flat_bench"], load: 2, unilateral: true, dbLimited: true, aliases: ["db row", "one arm row", "single arm row"] }),
  E({ id: "cable_row", name: "Seated Cable Row", pattern: "h_pull", muscles: ["upper_back", "lats", "rear_delts", "biceps"], requires: ["cable_machine"], load: 2, aliases: ["cable row", "seated row"] }),
  E({ id: "machine_row", name: "Machine Row", pattern: "h_pull", muscles: ["upper_back", "lats", "rear_delts", "biceps"], requires: ["row_machine"], load: 2 }),
  E({ id: "inverted_row", name: "Inverted Row (Smith)", pattern: "h_pull", muscles: ["upper_back", "lats", "biceps"], requires: ["smith_machine"], load: 1, aliases: ["inverted row"] }),
  E({ id: "trx_row", name: "Suspension Row", pattern: "h_pull", muscles: ["upper_back", "lats", "biceps"], requires: ["suspension"], load: 1, aliases: ["trx row", "ring row"] }),
  E({ id: "band_row", name: "Band Row", pattern: "h_pull", muscles: ["upper_back", "rear_delts", "biceps"], requires: ["bands"], load: 1 }),

  // ── Vertical pull ──
  E({ id: "weighted_pullup", name: "Pull-Up", pattern: "v_pull", muscles: ["lats", "upper_back", "biceps"], requires: ["pullup_bar"], load: 2, aliases: ["pull up", "pullup", "chin up", "chinup", "weighted pull up"] }),
  E({ id: "lat_pulldown", name: "Lat Pulldown", pattern: "v_pull", muscles: ["lats", "upper_back", "biceps"], requires: ["lat_pulldown"], load: 2, aliases: ["pulldown", "lat pull down"] }),
  E({ id: "cable_pulldown", name: "Kneeling Cable Pulldown", pattern: "v_pull", muscles: ["lats", "upper_back", "biceps"], requires: ["cable_machine"], load: 2 }),
  E({ id: "band_pulldown", name: "Band Lat Pulldown", pattern: "v_pull", muscles: ["lats", "biceps"], requires: ["bands"], load: 1 }),
  E({ id: "db_pullover", name: "DB Pullover", pattern: "v_pull", muscles: ["lats", "chest"], requires: ["dumbbells", "flat_bench"], load: 2, dbLimited: true, aliases: ["pullover"] }),

  // ── Knee flexion / extension ──
  E({ id: "leg_curl", name: "Machine Leg Curl", pattern: "knee_flex", muscles: ["hamstrings"], requires: ["leg_curl"], load: 2, aliases: ["leg curl", "hamstring curl", "lying leg curl", "seated leg curl"] }),
  E({ id: "slider_curl", name: "Slider / Towel Leg Curl", pattern: "knee_flex", muscles: ["hamstrings", "glutes"], requires: [], load: 1, aliases: ["nordic", "nordic curl"] }),
  E({ id: "cable_leg_curl", name: "Standing Cable Leg Curl", pattern: "knee_flex", muscles: ["hamstrings"], requires: ["cable_machine"], load: 1, unilateral: true }),
  E({ id: "leg_extension", name: "Leg Extension", pattern: "knee_ext", muscles: ["quads"], requires: ["leg_extension"], load: 2, aliases: ["leg extension", "leg ext", "quad extension"] }),
  E({ id: "spanish_squat", name: "Band Spanish Squat", pattern: "knee_ext", muscles: ["quads"], requires: ["bands"], load: 1 }),
  E({ id: "sissy_squat", name: "Sissy Squat", pattern: "knee_ext", muscles: ["quads"], requires: [], load: 1 }),

  // ── Arms / delts ──
  E({ id: "bb_curl", name: "Barbell Curl", pattern: "biceps", muscles: ["biceps", "forearms"], requires: ["barbell"], load: 2, aliases: ["bb curl", "ez bar curl"] }),
  E({ id: "db_curl", name: "Dumbbell Curl", pattern: "biceps", muscles: ["biceps", "forearms"], requires: ["dumbbells"], load: 2, aliases: ["db curl", "curl", "bicep curl", "hammer curl", "incline curl"] }),
  E({ id: "cable_curl", name: "Cable Curl", pattern: "biceps", muscles: ["biceps"], requires: ["cable_machine"], load: 2 }),
  E({ id: "band_curl", name: "Band Curl", pattern: "biceps", muscles: ["biceps"], requires: ["bands"], load: 1 }),
  E({ id: "cable_pushdown", name: "Cable Triceps Pushdown", pattern: "triceps", muscles: ["triceps"], requires: ["cable_machine"], load: 2, aliases: ["pushdown", "tricep pushdown", "rope pushdown"] }),
  E({ id: "skullcrusher", name: "DB Skull Crusher", pattern: "triceps", muscles: ["triceps"], requires: ["dumbbells", "flat_bench"], load: 2, aliases: ["skull crusher", "lying tricep extension"] }),
  E({ id: "db_oh_ext", name: "DB Overhead Triceps Extension", pattern: "triceps", muscles: ["triceps"], requires: ["dumbbells"], load: 2, aliases: ["overhead extension", "tricep extension"] }),
  E({ id: "diamond_pushup", name: "Close-Grip Push-Up", pattern: "triceps", muscles: ["triceps", "chest"], requires: [], load: 1, aliases: ["diamond push up"] }),
  E({ id: "db_lateral", name: "DB Lateral Raise", pattern: "delts", muscles: ["side_delts"], requires: ["dumbbells"], load: 1, aliases: ["lateral raise", "side raise", "lat raise"] }),
  E({ id: "cable_lateral", name: "Cable Lateral Raise", pattern: "delts", muscles: ["side_delts"], requires: ["cable_machine"], load: 1 }),
  E({ id: "face_pull", name: "Cable Face Pull", pattern: "delts", muscles: ["rear_delts", "upper_back"], requires: ["cable_machine"], load: 1, aliases: ["face pull"] }),
  E({ id: "band_pull_apart", name: "Band Pull-Apart", pattern: "delts", muscles: ["rear_delts", "upper_back"], requires: ["bands"], load: 1, aliases: ["pull apart"] }),
  E({ id: "db_rear_fly", name: "DB Rear Delt Fly", pattern: "delts", muscles: ["rear_delts", "upper_back"], requires: ["dumbbells"], load: 1, aliases: ["rear delt fly", "reverse fly"] }),

  // ── Core / calves / carries ──
  E({ id: "cable_crunch", name: "Cable Crunch", pattern: "core", muscles: ["abs"], requires: ["cable_machine"], load: 2 }),
  E({ id: "hanging_leg_raise", name: "Hanging Leg Raise", pattern: "core", muscles: ["abs", "obliques"], requires: ["pullup_bar"], load: 1, aliases: ["leg raise", "hanging knee raise"] }),
  E({ id: "pallof_press", name: "Cable Pallof Press", pattern: "core", muscles: ["obliques", "abs"], requires: ["cable_machine"], load: 1, aliases: ["pallof"] }),
  E({ id: "ab_wheel", name: "Ab Wheel / Plank Walkout", pattern: "core", muscles: ["abs"], requires: [], load: 1, aliases: ["ab wheel", "rollout", "plank walkout"] }),
  E({ id: "dead_bug", name: "Dead Bug", pattern: "core", muscles: ["abs"], requires: [], load: 1 }),
  E({ id: "plank", name: "Plank", pattern: "core", muscles: ["abs", "obliques"], requires: [], load: 1, aliases: ["plank", "forearm plank", "high plank"] }),
  E({ id: "side_plank", name: "Side Plank", pattern: "core", muscles: ["obliques", "abs"], requires: [], load: 1, unilateral: true }),
  E({ id: "crunch", name: "Crunch", pattern: "core", muscles: ["abs"], requires: [], load: 1, aliases: ["crunches", "sit up", "situp"] }),
  E({ id: "bicycle_crunch", name: "Bicycle Crunch", pattern: "core", muscles: ["abs", "obliques"], requires: [], load: 1, aliases: ["bicycle", "bicycles"] }),
  E({ id: "bird_dog", name: "Bird Dog", pattern: "core", muscles: ["abs", "lower_back"], requires: [], load: 1 }),
  E({ id: "wall_sit", name: "Wall Sit", pattern: "knee_ext", muscles: ["quads"], requires: [], load: 1 }),
  E({ id: "calf_raise_machine", name: "Smith Calf Raise", pattern: "calves", muscles: ["calves"], requires: ["smith_machine"], load: 2, aliases: ["calf raise", "standing calf raise"] }),
  E({ id: "db_calf_raise", name: "Single-Leg DB Calf Raise", pattern: "calves", muscles: ["calves"], requires: ["dumbbells"], load: 1, unilateral: true }),
  E({ id: "bw_calf_raise", name: "Bodyweight Calf Raise", pattern: "calves", muscles: ["calves"], requires: [], load: 1, unilateral: true }),
  E({ id: "farmer_carry", name: "DB Farmer Carry", pattern: "carry", muscles: ["forearms", "traps", "abs"], requires: ["dumbbells"], load: 2, dbLimited: true, aliases: ["farmers walk", "farmer walk", "carry"] }),
  E({ id: "suitcase_carry", name: "KB Suitcase Carry", pattern: "carry", muscles: ["obliques", "forearms"], requires: ["kettlebell"], load: 2, unilateral: true }),

  // ── Cardio / stretching ──
  E({ id: "treadmill_run", name: "Treadmill Run / Jog", pattern: "cardio", muscles: ["heart", "quads", "calves"], requires: ["treadmill"], load: 2, aliases: ["treadmill", "treadmill run", "treadmill jog"] }),
  E({ id: "treadmill_walk", name: "Incline Treadmill Walk", pattern: "cardio", muscles: ["heart", "glutes", "calves"], requires: ["treadmill"], load: 1, aliases: ["incline walk", "treadmill walk"] }),
  E({ id: "bike", name: "Exercise Bike", pattern: "cardio", muscles: ["heart", "quads"], requires: ["exercise_bike"], load: 2, aliases: ["bike", "cycling", "cycle", "spin", "stationary bike", "peloton"] }),
  E({ id: "elliptical", name: "Elliptical", pattern: "cardio", muscles: ["heart", "quads", "glutes"], requires: ["elliptical"], load: 2, aliases: ["cross trainer"] }),
  E({ id: "rower", name: "Rowing Machine", pattern: "cardio", muscles: ["heart", "upper_back", "quads"], requires: ["rower"], load: 2, aliases: ["rowing", "erg", "rower", "rowing machine"] }),
  E({ id: "jump_rope", name: "Jump Rope", pattern: "cardio", muscles: ["heart", "calves"], requires: ["jump_rope"], load: 2, aliases: ["skipping", "jump rope", "skip rope"] }),
  E({ id: "brisk_walk", name: "Brisk Walk", pattern: "cardio", muscles: ["heart", "glutes", "calves"], requires: [], load: 1, aliases: ["walk", "walking", "hike", "hiking"] }),
  E({ id: "outdoor_run", name: "Outdoor Run / Jog", pattern: "cardio", muscles: ["heart", "quads", "calves"], requires: [], load: 2, aliases: ["run", "running", "jog", "jogging", "outdoor run"] }),
  E({ id: "jumping_jacks", name: "Jumping Jacks", pattern: "cardio", muscles: ["heart", "calves"], requires: [], load: 1, aliases: ["jumping jack", "star jumps"] }),
  E({ id: "high_knees", name: "High Knees", pattern: "cardio", muscles: ["heart", "quads"], requires: [], load: 2, aliases: ["running in place"] }),
  E({ id: "mountain_climbers", name: "Mountain Climbers", pattern: "cardio", muscles: ["heart", "abs"], requires: [], load: 2, aliases: ["mountain climber"] }),
  E({ id: "stretching", name: "Stretching", pattern: "mobility", muscles: ["hamstrings", "glutes", "lower_back"], requires: [], load: 1, aliases: ["stretch", "cool down", "warm up", "mobility"] }),
  E({ id: "yoga_flow", name: "Yoga Flow", pattern: "mobility", muscles: ["hamstrings", "glutes", "abs"], requires: [], load: 1, aliases: ["yoga", "sun salutation"] }),
  E({ id: "burpees", name: "Burpees", pattern: "cardio", muscles: ["heart", "chest", "quads"], requires: [], load: 2, aliases: ["burpee"] }),
];

export const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const PATTERN_LABEL: Record<Pattern, string> = {
  squat: "Squat",
  hinge: "Hinge",
  lunge: "Single-leg",
  h_push: "Horizontal push",
  v_push: "Vertical push",
  h_pull: "Horizontal pull",
  v_pull: "Vertical pull",
  knee_flex: "Knee flexion",
  knee_ext: "Knee extension",
  biceps: "Biceps",
  triceps: "Triceps",
  delts: "Delts",
  core: "Core",
  calves: "Calves",
  carry: "Carry",
  cardio: "Cardio",
  mobility: "Stretch & mobility",
};

/** Fallback patterns to borrow from when nothing in the same pattern is available. */
export const RELATED_PATTERNS: Partial<Record<Pattern, Pattern[]>> = {
  squat: ["lunge"],
  lunge: ["squat"],
  hinge: ["knee_flex"],
  knee_flex: ["hinge"],
  knee_ext: ["squat", "lunge"],
  h_push: ["v_push", "triceps"],
  v_push: ["h_push", "delts"],
  h_pull: ["v_pull", "delts"],
  v_pull: ["h_pull"],
  triceps: ["h_push"],
  biceps: ["h_pull"],
  delts: ["v_push"],
  carry: ["core"],
  cardio: ["core"],
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(dumbbell)\b/g, "db")
    .replace(/\b(barbell)\b/g, "bb")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) =>
      /(ch|sh|x)es$/.test(w) ? w.slice(0, -2) : w.length >= 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w,
    )
    .join(" ");
}

/** Best-effort match of free-text exercise names to the library. */
export function findExercise(name: string): Exercise | null {
  const n = normalize(name);
  if (!n) return null;
  let best: { ex: Exercise; score: number } | null = null;
  for (const ex of EXERCISES) {
    const candidates = [ex.name, ...(ex.aliases ?? [])].map(normalize);
    for (const c of candidates) {
      let score = 0;
      // Prefer the candidate that covers the most of the input (and vice versa).
      if (c === n) score = 100;
      else if (` ${n} `.includes(` ${c} `)) score = 20 + 60 * (c.length / n.length);
      else if (` ${c} `.includes(` ${n} `)) score = 15 + 55 * (n.length / c.length);
      if (score && (!best || score > best.score)) best = { ex, score };
    }
  }
  return best?.ex ?? null;
}
