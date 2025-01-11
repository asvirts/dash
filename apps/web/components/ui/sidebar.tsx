"use client"

import { createContext, useContext, useState } from "react"
import { useIsMobile } from "../../hooks/use-mobile"

type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function SidebarTrigger() {
  const context = useContext(SidebarContext)
  if (!context)
    throw new Error("SidebarTrigger must be used within SidebarProvider")

  return <button onClick={context.toggle}>Toggle Sidebar</button>
}
