'use client'

import { SidebarNav } from './SidebarNav'
import { BottomNav } from './BottomNav'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Toaster } from 'sonner'
import { SuggestionEngine } from '@/components/SuggestionEngine'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // We persist with `skipHydration: true` so SSR markup is stable. Rehydrate
  // from localStorage after mount. If the stored payload is unreadable or
  // throws during merge, wipe it and re-render with defaults rather than
  // leaving the user stuck on a black screen.
  useEffect(() => {
    const recover = () => {
      try { localStorage.removeItem('life-os:v1') } catch {}
    }
    try {
      const result = useStore.persist.rehydrate()
      if (result && typeof (result as Promise<void>).catch === 'function') {
        ;(result as Promise<void>).catch(recover)
      }
    } catch {
      recover()
    }
  }, [])

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      {/* Main content — simple per-route fade-in. Dropping AnimatePresence
          here because the exit animation can leave content pinned at
          opacity:0 under React 19 + rapid route changes during recovery. */}
      <main className="lg:pl-[240px] min-h-dvh pb-[68px] lg:pb-0">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="min-h-dvh"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>

      <Toaster position="top-center" />
      <SuggestionEngine />
    </div>
  )
}
