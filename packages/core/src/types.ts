import type { Prescribed } from "./adapt";
import type { EquipmentId } from "./equipment";

/** A workout the user does regularly (e.g. "Lower Strength"). */
export type Routine = {
  id: string;
  name: string;
  /** Source text, one exercise per line. */
  text: string;
  exercises: Prescribed[];
  updatedAt: string;
};

export type Gym = {
  id: string;
  name: string;
  kind: "home" | "travel";
  items: EquipmentId[];
  maxDumbbellLbs: number | null;
  summary?: string | null;
  updatedAt: string;
};

export type SetLog = {
  reps: number | null;
  weight: number | null;
  done: boolean;
};

export type SessionEntry = {
  uid: string;
  original: Prescribed;
  /** Ranked options available at this gym; options[pick] is what's performed. */
  options: { exerciseId: string; match: number }[];
  pick: number;
  exerciseId: string | null;
  exerciseName: string;
  match: number | null;
  targetReps: string;
  loadHint: string | null;
  cues: string[];
  sets: SetLog[];
};

export type Session = {
  id: string;
  routineId: string | null;
  routineName: string;
  gymId: string | null;
  gymName: string;
  startedAt: string;
  finishedAt: string | null;
  entries: SessionEntry[];
  notes?: string;
};

export type Collections = {
  routines: Routine;
  gyms: Gym;
  sessions: Session;
};
export type Kind = keyof Collections;
