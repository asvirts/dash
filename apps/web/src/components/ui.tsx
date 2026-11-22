import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PageTitle({ children, sub, action }: { children: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
        {sub && <p className="mt-1 text-sm text-mute">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-panel p-4 ${className}`}>{children}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-widest text-mute">{children}</h2>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger" };

const VARIANTS = {
  primary: "bg-lime text-bg font-semibold hover:brightness-110",
  outline: "border border-line text-ink hover:border-mute",
  ghost: "text-mute hover:text-ink",
  danger: "border border-rose/40 text-rose hover:bg-rose/10",
};

export function Button({ variant = "primary", className = "", ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function LinkButton({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: keyof typeof VARIANTS; className?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function MatchPill({ match }: { match: number }) {
  const color = match >= 85 ? "bg-lime/15 text-lime" : match >= 70 ? "bg-amber/15 text-amber" : "bg-rose/15 text-rose";
  return <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${color}`}>{match}%</span>;
}

export function Loading() {
  return <div className="py-20 text-center text-sm text-mute">Loading…</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-xl border border-line bg-panel-2 px-3 py-2 outline-none focus:border-lime/60 ${props.className ?? ""}`}
    />
  );
}

export function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  if (d < 14) return `${Math.floor(d)} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
