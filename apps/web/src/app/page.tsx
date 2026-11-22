import { adaptWorkout, formatTarget, parseWorkout, prescribe, type GymInventory } from "@anygym/core";
import Link from "next/link";
import { APP_STORE_URL } from "./site";

// The demo card is computed with the app's real adaptation engine, so the site never drifts from the product.
const HOTEL: GymInventory = { items: ["dumbbells", "bench", "exercise_bike"], maxDumbbellLbs: 30 };
const DEMO = adaptWorkout(parseWorkout("Treadmill 20 min\nLeg press 3x12\nCable row 3x12\nPlank 3x30s"), HOTEL).map((a) => {
  const pick = a.options[a.pick];
  const rx = prescribe(a, HOTEL);
  return {
    from: a.originalExercise?.name ?? a.original.rawName,
    to: pick?.exercise.name ?? a.original.rawName,
    swapped: !!pick && pick.exercise.id !== a.originalExercise?.id,
    match: pick?.match ?? null,
    target: formatTarget(rx.sets, rx.reps),
  };
});

const STEPS = [
  {
    n: "1",
    title: "Write your workout like a note",
    body: "“Squats 3x12”, “Plank 3x30s”, “Walk 20 min”. Anygym understands it. No exercise database to scroll through.",
  },
  {
    n: "2",
    title: "Somewhere new? Snap the gym",
    body: "Take a photo or a short video of a hotel gym, a friend’s garage, or a new studio. AI spots the equipment in seconds.",
  },
  {
    n: "3",
    title: "Your workout, adjusted",
    body: "Every exercise you can’t do there gets swapped for the closest match, with reps adjusted so it’s just as good.",
  },
];

const FEATURES = [
  { icon: "🏃", title: "Cardio counts", body: "Treadmill, bike, rower, a walk around the block. Log time or distance, not just reps." },
  { icon: "🧘", title: "No equipment? No problem", body: "Bodyweight moves, stretching and quick routines that work in a living room." },
  { icon: "🏋️", title: "Weights when you want them", body: "Dumbbells, machines and barbells are all there. Weight is always optional." },
  { icon: "✈️", title: "Made for real life", body: "Travel, a busy gym, a different location. Your routine adapts instead of falling apart." },
  { icon: "📈", title: "See your streak", body: "Workouts and active minutes each week, plus what you did last time." },
  { icon: "🔒", title: "Use it without an account", body: "Everything works on your phone. Sign in only if you want to sync." },
];

const FAQ = [
  {
    q: "Is this for serious lifters?",
    a: "It works for them, but it’s built for everyone else: people who walk, run, do a few squats and push-ups, or follow a simple dumbbell routine.",
  },
  {
    q: "Do I need an account?",
    a: "No. Anygym works fully on your phone. Create an account only if you want your workouts backed up and synced.",
  },
  {
    q: "What happens to my gym photos?",
    a: "They’re used only to identify the equipment and aren’t stored by Anygym. Only the equipment list is saved. See our privacy policy for details.",
  },
  { q: "Which phones does it work on?", a: "iPhone for now. Android isn’t available yet." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="grid items-center gap-12 pb-20 pt-10 md:grid-cols-[1.1fr_1fr] md:pt-16">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-mute">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> For everyday workouts
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Your workout,
            <br />
            <span className="text-lime">wherever you are.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-mute">
            A simple workout tracker for walks, bodyweight moves, dumbbells and the gym. When you’re somewhere new, snap a photo
            and Anygym adapts your routine to the equipment that’s there.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StoreButton />
            <a href="#how" className="rounded-xl px-4 py-3 text-sm text-mute hover:text-ink">
              See how it works ↓
            </a>
          </div>
        </div>
        <PhoneDemo />
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-t border-line py-20">
        <SectionHeading eyebrow="How it works" title="Three steps. No spreadsheets." />
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-panel p-6">
              <div className="mb-4 grid h-8 w-8 place-items-center rounded-lg bg-lime font-mono text-sm font-bold text-bg">{s.n}</div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line py-20">
        <SectionHeading eyebrow="Features" title="Built for regular people doing regular workouts." />
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-mute">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-line py-20">
        <SectionHeading eyebrow="FAQ" title="Questions" />
        <div className="divide-y divide-line rounded-2xl border border-line bg-panel">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-mute transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-mute">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mb-10 rounded-3xl border border-lime/30 bg-lime/10 px-6 py-14 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Keep moving, wherever you are.</h2>
        <p className="mx-auto mt-3 max-w-md text-mute">Free to download. No account needed.</p>
        <div className="mt-7 flex justify-center">
          <StoreButton />
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-lime">{eyebrow}</p>
      <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function StoreButton() {
  const inner = (
    <>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
        <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.4-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.09 1.75-.96 2.79 1.02.08 2.05-.52 2.68-1.27z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-wider opacity-70">{APP_STORE_URL ? "Download on the" : "Coming soon to the"}</span>
        <span className="block text-base font-semibold">App Store</span>
      </span>
    </>
  );
  const cls = "inline-flex items-center gap-3 rounded-xl px-5 py-2.5";
  return APP_STORE_URL ? (
    <Link href={APP_STORE_URL} className={`${cls} bg-lime text-bg hover:brightness-110`}>
      {inner}
    </Link>
  ) : (
    <span className={`${cls} cursor-default border border-line text-ink`}>{inner}</span>
  );
}

function PhoneDemo() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -inset-10 -z-10 rounded-full bg-lime/10 blur-3xl" />
      <div className="rounded-[2.5rem] border border-line bg-panel p-3 shadow-2xl shadow-black/60">
        <div className="rounded-[2rem] bg-bg px-4 pb-6 pt-5">
          <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-panel-2" />
          <p className="text-[11px] uppercase tracking-widest text-mute">Hotel gym · Today</p>
          <p className="text-xl font-semibold">Your usual workout</p>
          <div className="mt-3 rounded-xl bg-lime/10 px-3 py-2 text-xs font-medium text-lime">
            📷 {DEMO.filter((d) => d.swapped).length} swaps for what’s here. Same workout.
          </div>
          <div className="mt-3 space-y-2">
            {DEMO.map((d) => (
              <div key={d.from} className="rounded-xl border border-line bg-panel px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {d.swapped && <div className="truncate text-[11px] text-mute line-through">{d.from}</div>}
                    <div className="truncate text-sm font-semibold">{d.to}</div>
                    <div className="font-mono text-xs text-mute">{d.target}</div>
                  </div>
                  {d.swapped && d.match != null && (
                    <span className="shrink-0 rounded-full bg-lime/15 px-2 py-0.5 font-mono text-[11px] text-lime">{d.match}%</span>
                  )}
                  {!d.swapped && <span className="shrink-0 text-xs text-mute">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
