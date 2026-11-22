"use client";

import { sessionStats } from "@anygym/core";
import Link from "next/link";
import { Card, Loading, PageTitle } from "@/components/ui";
import { useData } from "@/lib/data";

export default function HistoryPage() {
  const { ready, sessions } = useData();
  if (!ready) return <Loading />;
  const done = sessions.filter((s) => s.finishedAt);

  const weekAgo = daysAgo(7);
  const thisWeek = done.filter((s) => new Date(s.startedAt).getTime() > weekAgo);
  const away = done.filter((s) => sessionStats(s).swaps > 0).length;

  return (
    <>
      <PageTitle sub={`${done.length} workouts logged · ${away} on the road`}>History</PageTitle>

      <Card className="mb-5 grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-2xl font-semibold text-lime">{thisWeek.length}</div>
          <div className="text-[11px] uppercase tracking-widest text-mute">this week</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">
            {Math.round(thisWeek.reduce((n, s) => n + sessionStats(s).volume, 0)).toLocaleString()}
          </div>
          <div className="text-[11px] uppercase tracking-widest text-mute">lb volume this week</div>
        </div>
      </Card>

      <div className="space-y-2">
        {done.map((s) => {
          const st = sessionStats(s);
          const d = new Date(s.startedAt);
          return (
            <Link key={s.id} href={`/session/${s.id}`}>
              <Card className="flex items-center gap-4 transition hover:border-mute">
                <div className="w-12 text-center">
                  <div className="text-[11px] uppercase text-mute">{d.toLocaleDateString(undefined, { month: "short" })}</div>
                  <div className="text-xl font-semibold">{d.getDate()}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{s.routineName}</div>
                  <div className="truncate text-xs text-mute">
                    {s.gymName} · {st.done}/{st.sets} sets · {Math.round(st.volume).toLocaleString()} lb
                  </div>
                </div>
                {st.swaps > 0 && <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[11px] text-amber">✈️ {st.swaps} swaps</span>}
              </Card>
            </Link>
          );
        })}
        {!done.length && <Card className="text-center text-sm text-mute">No finished workouts yet. Start one from Today.</Card>}
      </div>
    </>
  );
}

function daysAgo(n: number) {
  return Date.now() - n * 86400000;
}
