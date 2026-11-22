"use client";

import { type Gym } from "@anygym/core";
import { useState } from "react";
import { GymEditor } from "@/components/GymEditor";
import { Button, Card, LinkButton, Loading, PageTitle } from "@/components/ui";
import { useData } from "@/lib/data";

export default function GymsPage() {
  const { ready, gyms, currentGym, setCurrentGymId, upsert, remove } = useData();
  const [editing, setEditing] = useState<Gym | null>(null);
  if (!ready) return <Loading />;

  if (editing)
    return (
      <>
        <PageTitle>Edit gym</PageTitle>
        <GymEditor gym={editing} onChange={setEditing} />
        <div className="mt-6 flex gap-3">
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm(`Delete “${editing.name}”?`)) return;
              await remove("gyms", editing.id);
              setEditing(null);
            }}
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!editing.name.trim()}
            onClick={async () => {
              await upsert("gyms", { ...editing, updatedAt: new Date().toISOString() });
              setEditing(null);
            }}
          >
            Save
          </Button>
        </div>
      </>
    );

  return (
    <>
      <PageTitle sub="Your home gym plus any hotel or travel gyms you’ve scanned." action={<LinkButton href="/gyms/scan">📷 Scan</LinkButton>}>
        Gyms
      </PageTitle>
      <div className="space-y-3">
        {gyms.map((g) => (
          <Card key={g.id} className="flex items-center gap-3">
            <button onClick={() => setEditing(g)} className="min-w-0 flex-1 text-left">
              <div className="font-semibold">
                {g.kind === "home" ? "🏠" : "✈️"} {g.name}
              </div>
              <div className="truncate text-xs text-mute">
                {g.items.length} pieces of equipment{g.maxDumbbellLbs ? ` · DBs to ${g.maxDumbbellLbs} lb` : ""}
                {g.summary ? ` · ${g.summary}` : ""}
              </div>
            </button>
            {currentGym?.id === g.id ? (
              <span className="text-xs font-semibold text-lime">Current</span>
            ) : (
              <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => setCurrentGymId(g.id)}>
                Train here
              </Button>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
