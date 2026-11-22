"use client";

import {
  EXERCISE_BY_ID,
  formatSets,
  formatTarget,
  isSwapped,
  lastPerformance,
  now,
  repick,
  repsKind,
  sessionStats,
  type Session,
  type SessionEntry,
  type SetLog,
} from "@anygym/core";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Loading, MatchPill, timeAgo } from "@/components/ui";
import { useData } from "@/lib/data";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, sessions, gyms, upsert, remove } = useData();
  const router = useRouter();
  const stored = sessions.find((s) => s.id === id);
  const [s, setS] = useState<Session | null>(null);
  const dirty = useRef(false);

  // Take a local copy once loaded; edits autosave (debounced) below.
  if (stored && (!s || s.id !== stored.id)) setS(stored);

  useEffect(() => {
    if (!s || !dirty.current) return;
    const t = setTimeout(() => {
      dirty.current = false;
      upsert("sessions", s);
    }, 600);
    return () => clearTimeout(t);
  }, [s, upsert]);

  if (!ready) return <Loading />;
  if (!s) return <p className="py-20 text-center text-mute">Session not found.</p>;

  const gym = gyms.find((g) => g.id === s.gymId) ?? null;
  const stats = sessionStats(s);

  function edit(fn: (s: Session) => Session) {
    dirty.current = true;
    setS((prev) => (prev ? fn(prev) : prev));
  }
  const editEntry = (uid: string, fn: (e: SessionEntry) => SessionEntry) =>
    edit((x) => ({ ...x, entries: x.entries.map((e) => (e.uid === uid ? fn(e) : e)) }));
  const editSet = (uid: string, i: number, patch: Partial<SetLog>) =>
    editEntry(uid, (e) => ({ ...e, sets: e.sets.map((st, j) => (j === i ? { ...st, ...patch } : st)) }));

  async function finish() {
    const done = { ...s!, finishedAt: now() };
    dirty.current = false;
    setS(done);
    await upsert("sessions", done);
    router.push("/history");
  }

  async function discard() {
    if (!confirm("Delete this workout?")) return;
    await remove("sessions", s!.id);
    router.push("/");
  }

  return (
    <>
      <div className="mb-4">
        <div className="text-xs uppercase tracking-widest text-mute">
          {s.gymName} · {timeAgo(s.startedAt)}
          {s.finishedAt && " · finished"}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{s.routineName}</h1>
      </div>

      {stats.swaps > 0 && (
        <Card className="mb-4 grid grid-cols-3 gap-2 text-center">
          <Stat value={stats.swaps} label="swaps" />
          <Stat value={`${stats.avgMatch}%`} label="avg match" accent />
          <Stat value={stats.sets} label="sets" />
          <div className={`col-span-3 rounded-lg py-1.5 text-xs font-semibold ${stats.intact ? "bg-lime/10 text-lime" : "bg-amber/10 text-amber"}`}>
            {stats.intact ? "✓ Same workout, adapted to this gym" : "⚠ Some exercises only have rough matches here"}
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {s.entries.map((e, i) => (
          <EntryCard
            key={e.uid}
            index={i}
            entry={e}
            last={e.exerciseId ? lastPerformance(sessions, e.exerciseId, s.id) : null}
            onRepick={(pick) => editEntry(e.uid, (x) => repick(x, pick, gym))}
            onSet={(j, patch) => editSet(e.uid, j, patch)}
            onAddSet={() =>
              editEntry(e.uid, (x) => ({ ...x, sets: [...x.sets, { ...(x.sets.at(-1) ?? { reps: null, weight: null }), done: false }] }))
            }
          />
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="danger" onClick={discard}>
          Delete
        </Button>
        {!s.finishedAt && (
          <Button className="flex-1" onClick={finish}>
            Finish workout ({stats.done}/{stats.sets} sets)
          </Button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[61px] z-10 h-1 bg-panel-2 sm:bottom-0">
        <div className="h-full bg-lime transition-all" style={{ width: `${stats.sets ? (stats.done / stats.sets) * 100 : 0}%` }} />
      </div>
    </>
  );
}

function EntryCard({
  entry: e,
  index,
  last,
  onRepick,
  onSet,
  onAddSet,
}: {
  entry: SessionEntry;
  index: number;
  last: ReturnType<typeof lastPerformance>;
  onRepick: (pick: number) => void;
  onSet: (i: number, patch: Partial<SetLog>) => void;
  onAddSet: () => void;
}) {
  const [open, setOpen] = useState(false);
  const swapped = isSwapped(e);
  // Timed/distance blocks just get checked off; weight only shows for exercises that use equipment.
  const showReps = repsKind(e.targetReps) === "reps";
  const ex = e.exerciseId ? EXERCISE_BY_ID[e.exerciseId] : null;
  const showWeight = showReps && (!!ex?.requires.length || e.sets.some((st) => st.weight != null));
  const cols = showWeight ? "grid-cols-[2rem_1fr_1fr_3rem]" : "grid-cols-[2rem_1fr_3rem]";
  return (
    <Card className="p-0">
      <button className="flex w-full items-start gap-3 p-4 text-left" onClick={() => setOpen(!open)} disabled={e.options.length < 2}>
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-panel-2 font-mono text-xs">{index + 1}</span>
        <div className="min-w-0 flex-1">
          {swapped && <div className="truncate text-xs text-mute line-through">{e.original.rawName}</div>}
          <div className="font-semibold">{e.exerciseName}</div>
          <div className="font-mono text-sm text-ink/80">
            {formatTarget(e.sets.length, e.targetReps)}
            {e.loadHint && <span className="text-mute"> · {e.loadHint}</span>}
          </div>
          {last && (
            <div className="mt-0.5 text-xs text-mute">
              Last ({timeAgo(last.date)}): {formatSets(last.sets)}
            </div>
          )}
          {!e.exerciseId && <div className="mt-1 text-sm text-rose">Nothing here works for this one. Skip it today.</div>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {e.match != null && e.match < 100 && <MatchPill match={e.match} />}
          {e.options.length > 1 && <span className="text-xs text-mute">{open ? "close" : "swap ⇄"}</span>}
        </div>
      </button>

      {e.cues.length > 0 && (
        <ul className="-mt-2 space-y-0.5 px-4 pb-3 pl-13 text-xs text-mute">
          {e.cues.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>
      )}

      {open && (
        <div className="border-t border-line bg-panel-2/60 p-2">
          {e.options.map((o, j) => (
            <button
              key={o.exerciseId}
              onClick={() => {
                onRepick(j);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-panel ${j === e.pick ? "text-lime" : ""}`}
            >
              <span>
                {j === e.pick ? "● " : "○ "}
                {EXERCISE_BY_ID[o.exerciseId]?.name}
              </span>
              <MatchPill match={o.match} />
            </button>
          ))}
        </div>
      )}

      {e.exerciseId && (
        <div className="border-t border-line px-4 py-2">
          <div className={`grid ${cols} items-center gap-2 pb-1 text-[11px] uppercase tracking-widest text-mute`}>
            <span>Set</span>
            {showWeight && <span>lb</span>}
            <span>{showReps ? "Reps" : "Target"}</span>
            <span />
          </div>
          {e.sets.map((st, j) => (
            <div key={j} className={`grid ${cols} items-center gap-2 py-1 ${st.done ? "opacity-70" : ""}`}>
              <span className="font-mono text-sm text-mute">{j + 1}</span>
              {showWeight && (
                <NumInput value={st.weight} placeholder={last?.sets[j]?.weight?.toString() ?? "—"} onChange={(v) => onSet(j, { weight: v })} />
              )}
              {showReps ? (
                <NumInput value={st.reps} placeholder={e.targetReps} onChange={(v) => onSet(j, { reps: v })} />
              ) : (
                <span className="font-mono text-sm">{e.targetReps}</span>
              )}
              <button
                onClick={() => onSet(j, { done: !st.done })}
                aria-label={st.done ? "Mark set not done" : "Mark set done"}
                className={`h-9 rounded-lg border text-sm transition ${st.done ? "border-lime bg-lime font-bold text-bg" : "border-line text-mute hover:border-mute"}`}
              >
                ✓
              </button>
            </div>
          ))}
          <button onClick={onAddSet} className="mt-1 w-full py-1.5 text-xs text-mute hover:text-ink">
            + Add set
          </button>
        </div>
      )}
    </Card>
  );
}

function NumInput({ value, placeholder, onChange }: { value: number | null; placeholder?: string; onChange: (v: number | null) => void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(ev) => onChange(ev.target.value === "" ? null : +ev.target.value)}
      className="h-9 w-full rounded-lg border border-line bg-panel-2 px-2 text-center font-mono text-sm outline-none focus:border-lime/60"
    />
  );
}

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-2xl font-semibold ${accent ? "text-lime" : ""}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-mute">{label}</div>
    </div>
  );
}
