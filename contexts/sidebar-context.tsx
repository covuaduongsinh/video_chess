'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

type SidebarProviderProps = {
  children: ReactNode
}

type SidebarContextType = {
  isLargeOpen: boolean
  isSmallOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

/** Màn hình nhỏ (< 1024px) → dùng sidebar dạng overlay. */
function isSmallScreen(): boolean {
  return window.innerWidth < 1024
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (context === null) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isLargeOpen, setIsLargeOpen] = useState(true)
  const [isSmallOpen, setIsSmallOpen] = useState(false)

  useEffect(() => {
    const handler = () => {
      if (!isSmallScreen()) {
        setIsSmallOpen(false)
      }
    }

    window.addEventListener('resize', handler)

    return () => {
      window.removeEventListener('resize', handler)
    }
  }, [])

  function toggle(): void {
    if (isSmallScreen()) {
      setIsSmallOpen(!isSmallOpen)
    } else {
      setIsLargeOpen(!isLargeOpen)
    }
  }

  function close(): void {
    if (isSmallScreen()) {
      setIsSmallOpen(false)
    } else {
      setIsLargeOpen(false)
    }
  }

  return (
    <SidebarContext.Provider
      value={{
        isLargeOpen,
        isSmallOpen,
        toggle,
        close
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
