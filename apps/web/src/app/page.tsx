"use client";

import { sessionStats, startSession, type Routine } from "@anygym/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, LinkButton, Loading, PageTitle, SectionLabel, timeAgo } from "@/components/ui";
import { useData } from "@/lib/data";

export default function Today() {
  const { ready, routines, gyms, sessions, currentGym, setCurrentGymId, upsert } = useData();
  const router = useRouter();
  if (!ready) return <Loading />;

  const active = sessions.find((s) => !s.finishedAt);
  const lastDone = (r: Routine) => sessions.find((s) => s.routineId === r.id && s.finishedAt);

  async function start(r: Routine) {
    const s = startSession(r, currentGym);
    await upsert("sessions", s);
    router.push(`/session/${s.id}`);
  }

  return (
    <>
      <PageTitle sub={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}>
        Let’s train
      </PageTitle>

      {active && (
        <Link href={`/session/${active.id}`}>
          <Card className="mb-5 flex items-center justify-between border-lime/40 bg-lime/10">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-lime">In progress</div>
              <div className="font-semibold">
                {active.routineName} · {active.gymName}
              </div>
              <div className="text-xs text-mute">
                {sessionStats(active).done}/{sessionStats(active).sets} sets done
              </div>
            </div>
            <span className="text-lime">Resume →</span>
          </Card>
        </Link>
      )}

      <SectionLabel>Where are you training?</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {gyms.map((g) => (
          <button
            key={g.id}
            onClick={() => setCurrentGymId(g.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              currentGym?.id === g.id ? "border-lime bg-lime/10 text-lime" : "border-line text-mute hover:text-ink"
            }`}
          >
            {g.kind === "home" ? "🏠" : "✈️"} {g.name}
          </button>
        ))}
        <Link href="/gyms/scan" className="rounded-full border border-dashed border-lime/50 px-3 py-1.5 text-sm text-lime hover:bg-lime/10">
          📷 Scan a new gym
        </Link>
      </div>
      {currentGym && currentGym.kind === "travel" && (
        <p className="mt-2 text-xs text-mute">
          Routines will be adapted to the {currentGym.items.length} pieces of equipment at {currentGym.name}.
        </p>
      )}

      <SectionLabel>Your routines</SectionLabel>
      <div className="space-y-3">
        {routines.map((r) => {
          const last = lastDone(r);
          return (
            <Card key={r.id} className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{r.name}</div>
                <div className="truncate text-xs text-mute">
                  {r.exercises.map((e) => e.rawName).join(" · ")}
                </div>
                <div className="mt-1 text-[11px] text-mute">
                  {r.exercises.length} exercises{last ? ` · last done ${timeAgo(last.startedAt)}` : ""}
                </div>
              </div>
              <button
                onClick={() => start(r)}
                disabled={!r.exercises.length}
                className="shrink-0 rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-bg hover:brightness-110 disabled:opacity-40"
              >
                Start
              </button>
            </Card>
          );
        })}
        {!routines.length && (
          <Card className="text-center text-sm text-mute">
            No routines yet. <LinkButton href="/routines?new=1" variant="ghost">Create one →</LinkButton>
          </Card>
        )}
      </div>
    </>
  );
}
