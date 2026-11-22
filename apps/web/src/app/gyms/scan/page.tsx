"use client";

import { makeGym, type Gym } from "@anygym/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { GymEditor, type Detected } from "@/components/GymEditor";
import { Button, Loading, PageTitle } from "@/components/ui";
import { useData } from "@/lib/data";
import { imageToJpeg, videoToFrames } from "@/lib/media";

type Media = { id: string; kind: "photo" | "video"; frames: string[] };
const MAX_FRAMES = 8;

export default function ScanPage() {
  // Wait for client data so the new gym's id/timestamp are created in the browser, not at prerender.
  return useData().ready ? <Scanner /> : <Loading />;
}

function Scanner() {
  const { upsert, setCurrentGymId, accessToken, user } = useData();
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [busy, setBusy] = useState<null | "reading" | "scanning">(null);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<Record<string, Detected>>({});
  const [gym, setGym] = useState<Gym>(() => makeGym({ name: "" }));

  const frameCount = media.reduce((n, m) => n + m.frames.length, 0);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy("reading");
    setError(null);
    try {
      const added: Media[] = [];
      for (const f of Array.from(files)) {
        const id = `${f.name}-${f.size}-${f.lastModified}`;
        if (f.type.startsWith("video/")) added.push({ id, kind: "video", frames: await videoToFrames(f, 6) });
        else if (f.type.startsWith("image/")) added.push({ id, kind: "photo", frames: [await imageToJpeg(f)] });
      }
      setMedia((m) => [...m, ...added]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      setBusy(null);
    }
  }

  function framesToSend() {
    const all = media.flatMap((m) => m.frames);
    if (all.length <= MAX_FRAMES) return all;
    const step = all.length / MAX_FRAMES;
    return Array.from({ length: MAX_FRAMES }, (_, i) => all[Math.floor(i * step)]);
  }

  async function scan() {
    setBusy("scanning");
    setError(null);
    try {
      const token = await accessToken();
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ images: framesToSend() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed.");
      const list = data.equipment as Detected[];
      setDetected(Object.fromEntries(list.map((d) => [d.id, d])));
      setGym((g) => ({
        ...g,
        items: list.filter((d) => d.confidence !== "low").map((d) => d.id),
        maxDumbbellLbs: data.max_dumbbell_lbs ?? g.maxDumbbellLbs,
        summary: data.summary,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed.");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    const g = { ...gym, name: gym.name.trim() || "Hotel gym", updatedAt: new Date().toISOString() };
    await upsert("gyms", g);
    setCurrentGymId(g.id);
    router.push("/");
  }

  return (
    <>
      <PageTitle sub="Take a few photos or a slow panning video. AI picks out the equipment, and your routines adapt to it.">
        Scan a gym
      </PageTitle>

      <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment" hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      <input ref={uploadRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => cameraRef.current?.click()} className="flex flex-col items-center gap-1 rounded-2xl border border-lime/40 bg-lime/10 py-6 text-lime transition hover:bg-lime/15">
          <span className="text-2xl">📷</span>
          <span className="text-sm font-semibold">Photo / video</span>
        </button>
        <button onClick={() => uploadRef.current?.click()} className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-panel py-6 transition hover:border-mute">
          <span className="text-2xl">🖼️</span>
          <span className="text-sm font-semibold">Upload</span>
        </button>
      </div>

      {media.length > 0 && (
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {media.map((m) => (
              <div key={m.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.frames[0]} alt="" className="h-full w-full object-cover" />
                {m.kind === "video" && <span className="absolute bottom-1 left-1 rounded bg-bg/80 px-1 font-mono text-[10px]">▶ {m.frames.length}f</span>}
                <button onClick={() => setMedia(media.filter((x) => x.id !== m.id))} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-bg/80 text-xs" aria-label="Remove">
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-2 w-full border-lime py-3 font-semibold text-lime" onClick={scan} disabled={!!busy}>
            {busy === "scanning" ? "Scanning equipment…" : `✨ Detect equipment (${Math.min(frameCount, MAX_FRAMES)} frame${frameCount === 1 ? "" : "s"})`}
          </Button>
          {!user && (
            <p className="mt-2 text-center text-xs text-mute">
              AI scanning may require an account. <Link href="/account" className="text-lime">Sign in</Link>
            </p>
          )}
        </div>
      )}
      {busy === "reading" && <p className="mt-3 text-sm text-mute">Processing media…</p>}
      {error && <p className="mt-3 rounded-xl bg-rose/10 p-3 text-sm text-rose">{error}</p>}
      {gym.summary && <p className="mt-3 rounded-xl bg-lime/10 p-3 text-sm text-lime">{gym.summary}</p>}

      <div className="mt-6">
        <GymEditor gym={gym} onChange={setGym} detected={detected} />
      </div>

      <Button className="mt-6 w-full py-3.5" onClick={save}>
        Save gym & train here →
      </Button>
    </>
  );
}
