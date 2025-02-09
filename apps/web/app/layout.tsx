import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"

import {
  SidebarProvider,
  SidebarTrigger
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Analytics } from "@vercel/analytics/react"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans"
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased p-2`}
      >
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  )
}
