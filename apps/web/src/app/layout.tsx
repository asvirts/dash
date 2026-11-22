import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anygym: your workout, wherever you are",
  description:
    "A simple workout tracker for walks, bodyweight moves, dumbbells and the gym. Somewhere new? Snap a photo and Anygym adapts your routine to the equipment that's there.",
};

export const viewport: Viewport = { themeColor: "#0a0c0a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full font-sans">
        <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5">
          <header className="sticky top-0 z-20 -mx-5 border-b border-line/60 bg-bg/80 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-lime text-sm font-black text-bg">A</span>
                Anygym
              </Link>
              <nav className="flex gap-5 text-sm text-mute">
                <Link href="/#how" className="hover:text-ink">How it works</Link>
                <Link href="/#faq" className="hover:text-ink">FAQ</Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-8 text-sm text-mute">
            <span>Anygym</span>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          </footer>
        </div>
      </body>
    </html>
  );
}
