"use client";

import { EQUIPMENT, type EquipmentId, type Gym } from "@reprelay/core";
import { Card, Input, SectionLabel } from "./ui";

export type Detected = { id: EquipmentId; confidence: "high" | "medium" | "low"; evidence: string };

export function GymEditor({ gym, onChange, detected = {} }: { gym: Gym; onChange: (g: Gym) => void; detected?: Record<string, Detected> }) {
  const toggle = (id: EquipmentId) =>
    onChange({ ...gym, items: gym.items.includes(id) ? gym.items.filter((x) => x !== id) : [...gym.items, id] });

  return (
    <>
      <div className="flex gap-2">
        <Input value={gym.name} onChange={(e) => onChange({ ...gym, name: e.target.value })} placeholder="Gym name (e.g. Marriott Chicago)" className="min-w-0 flex-1" />
        <div className="flex rounded-xl border border-line p-1 text-sm">
          {(["home", "travel"] as const).map((k) => (
            <button
              key={k}
              onClick={() => onChange({ ...gym, kind: k })}
              className={`rounded-lg px-3 ${gym.kind === k ? "bg-panel-2 text-ink" : "text-mute"}`}
            >
              {k === "home" ? "🏠 Home" : "✈️ Travel"}
            </button>
          ))}
        </div>
      </div>

      <SectionLabel>
        Equipment · {gym.items.length} <span className="font-normal normal-case tracking-normal">(tap to fix)</span>
      </SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {EQUIPMENT.map((e) => {
          const on = gym.items.includes(e.id);
          const d = detected[e.id];
          return (
            <button
              key={e.id}
              onClick={() => toggle(e.id)}
              title={d?.evidence}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                on ? "border-lime/60 bg-lime/10 text-ink" : "border-line bg-panel text-mute"
              }`}
            >
              <span>{e.icon}</span>
              <span className="flex-1 truncate">{e.label}</span>
              {d && (
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${d.confidence === "high" ? "bg-lime" : d.confidence === "medium" ? "bg-amber" : "bg-rose"}`}
                  title={`AI: ${d.confidence} confidence. ${d.evidence}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {gym.items.includes("dumbbells") && (
        <Card className="mt-4 flex items-center justify-between gap-3">
          <label htmlFor="maxdb" className="text-sm">
            Heaviest dumbbell
            <span className="block text-xs text-mute">Used to scale reps when the rack runs light</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              id="maxdb"
              type="number"
              inputMode="numeric"
              value={gym.maxDumbbellLbs ?? ""}
              onChange={(e) => onChange({ ...gym, maxDumbbellLbs: e.target.value ? +e.target.value : null })}
              placeholder="50"
              className="w-20 rounded-lg border border-line bg-panel-2 px-2 py-1.5 text-right font-mono outline-none focus:border-lime/60"
            />
            <span className="text-sm text-mute">lb</span>
          </div>
        </Card>
      )}
    </>
  );
}
