"use client";

import { EXERCISES, EXERCISE_BY_ID, formatTarget, makeRoutine, parseWorkout, type Routine } from "@anygym/core";
import { useEffect, useState } from "react";
import { Button, Card, Input, Loading, PageTitle, SectionLabel } from "@/components/ui";
import { useData } from "@/lib/data";

export default function RoutinesPage() {
  const { ready, routines, upsert, remove } = useData();
  const [editing, setEditing] = useState<Routine | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open the editor when linked with ?new=1
    if (new URLSearchParams(window.location.search).has("new")) setEditing(makeRoutine("New routine", ""));
  }, []);

  if (!ready) return <Loading />;

  if (editing)
    return (
      <RoutineEditor
        initial={editing}
        isNew={!routines.some((r) => r.id === editing.id)}
        onCancel={() => setEditing(null)}
        onSave={async (r) => {
          await upsert("routines", r);
          setEditing(null);
        }}
        onDelete={async () => {
          if (!confirm(`Delete “${editing.name}”?`)) return;
          await remove("routines", editing.id);
          setEditing(null);
        }}
      />
    );

  return (
    <>
      <PageTitle
        sub="The workouts you do regularly. When you’re somewhere new, they adjust to whatever equipment is there."
        action={<Button onClick={() => setEditing(makeRoutine("New routine", ""))}>+ New</Button>}
      >
        Routines
      </PageTitle>
      <div className="space-y-3">
        {routines.map((r) => (
          <button key={r.id} onClick={() => setEditing(r)} className="block w-full text-left">
            <Card className="transition hover:border-mute">
              <div className="font-semibold">{r.name}</div>
              <div className="mt-1 space-y-0.5 font-mono text-xs text-mute">
                {r.exercises.map((e) => (
                  <div key={e.uid}>
                    {e.rawName} {formatTarget(e.sets, e.reps)}
                    {e.loadLbs ? ` @ ${e.loadLbs}` : ""}
                  </div>
                ))}
              </div>
            </Card>
          </button>
        ))}
      </div>
    </>
  );
}

function RoutineEditor({
  initial,
  isNew,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Routine;
  isNew: boolean;
  onSave: (r: Routine) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [text, setText] = useState(initial.text);
  const [exercises, setExercises] = useState(initial.exercises);

  function updateText(t: string) {
    setText(t);
    // Keep manual exercise picks for lines that didn't change.
    const prev = new Map(exercises.map((p) => [p.rawName.toLowerCase(), p.exerciseId]));
    setExercises(parseWorkout(t).map((p) => (p.exerciseId ? p : { ...p, exerciseId: prev.get(p.rawName.toLowerCase()) ?? null })));
  }

  const unknown = exercises.filter((p) => !p.exerciseId).length;

  return (
    <>
      <PageTitle sub="One exercise per line, like “Squats 3x12”, “Plank 3x30s” or “Walk 20 min”.">
        {isNew ? "New routine" : "Edit routine"}
      </PageTitle>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Routine name" className="mb-3 w-full text-lg font-semibold" />
      <textarea
        value={text}
        onChange={(e) => updateText(e.target.value)}
        rows={7}
        autoFocus={isNew}
        spellCheck={false}
        placeholder={"Squats 3x12\nPush-ups 3x10\nPlank 3x30s\nWalk 20 min"}
        className="w-full resize-y rounded-2xl border border-line bg-panel p-4 font-mono text-sm leading-relaxed outline-none focus:border-lime/60"
      />

      <SectionLabel>Recognized · {exercises.length}</SectionLabel>
      <Card className="divide-y divide-line p-0">
        {!exercises.length && <p className="p-4 text-sm text-mute">Each line needs sets×reps (3x10) or a time (20 min).</p>}
        {exercises.map((p, i) => (
          <div key={p.uid} className="flex items-center gap-3 px-4 py-3">
            <span className="w-5 font-mono text-xs text-mute">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <select
                value={p.exerciseId ?? ""}
                onChange={(e) => setExercises(exercises.map((w) => (w.uid === p.uid ? { ...w, exerciseId: e.target.value || null } : w)))}
                className={`w-full truncate bg-transparent text-sm font-medium outline-none ${p.exerciseId ? "" : "text-amber"}`}
              >
                {!p.exerciseId && <option value="">“{p.rawName}”: pick the closest match</option>}
                {EXERCISES.map((e) => (
                  <option key={e.id} value={e.id} className="bg-panel text-ink">
                    {e.name}
                  </option>
                ))}
              </select>
              {p.exerciseId && EXERCISE_BY_ID[p.exerciseId].name.toLowerCase() !== p.rawName.toLowerCase() && (
                <div className="truncate text-xs text-mute">from “{p.rawName}”</div>
              )}
            </div>
            <span className="whitespace-nowrap font-mono text-xs text-mute">
              {formatTarget(p.sets, p.reps)}
              {p.loadLbs ? ` @${p.loadLbs}` : ""}
            </span>
          </div>
        ))}
      </Card>
      {unknown > 0 && <p className="mt-2 text-xs text-amber">{unknown} not recognized. Pick the closest match so it can be adapted at other gyms.</p>}

      <div className="mt-6 flex gap-3">
        {!isNew && (
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={!name.trim() || !exercises.length}
          onClick={() => onSave({ ...initial, name: name.trim(), text, exercises, updatedAt: new Date().toISOString() })}
        >
          Save routine
        </Button>
      </div>
    </>
  );
}
