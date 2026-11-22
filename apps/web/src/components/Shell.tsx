"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Loading } from "./ui";
import { useData } from "@/lib/data";

const NAV = [
  { href: "/", label: "Today", icon: "⚡" },
  { href: "/routines", label: "Routines", icon: "📋" },
  { href: "/gyms", label: "Gyms", icon: "📍" },
  { href: "/history", label: "History", icon: "📈" },
];

type Active = (href: string) => boolean;
const none: Active = () => false;

/** usePathname is dynamic on routes like /session/[id], so read it inside Suspense. */
function WithPath({ render }: { render: (active: Active) => ReactNode }) {
  const path = usePathname();
  return render((href) => (href === "/" ? path === "/" : path.startsWith(href)));
}
const Nav = ({ render }: { render: (active: Active) => ReactNode }) => (
  <Suspense fallback={render(none)}>
    <WithPath render={render} />
  </Suspense>
);

export function Shell({ children }: { children: ReactNode }) {
  const { user } = useData();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-24 sm:pb-10">
      <header className="sticky top-0 z-20 -mx-4 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-lime text-sm font-black text-bg">R</span>
            RepRelay
          </Link>
          <Nav render={(active) => (<nav className="hidden gap-1 text-sm sm:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3 py-1 transition ${active(n.href) ? "bg-lime font-semibold text-bg" : "text-mute hover:text-ink"}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>)} />
          <Link href="/account" className="rounded-full border border-line px-3 py-1 text-xs text-mute hover:text-ink">
            {user ? user.email?.split("@")[0] : "Guest"}
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-5">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </main>

      <Nav render={(active) => (<nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-bg/95 backdrop-blur sm:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${active(n.href) ? "text-lime" : "text-mute"}`}
          >
            <span className="text-lg leading-none">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>)} />
    </div>
  );
}
