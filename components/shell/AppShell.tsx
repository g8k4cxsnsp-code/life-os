'use client'

import { SidebarNav } from './SidebarNav'
import { BottomNav } from './BottomNav'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // We persist with `skipHydration: true` so SSR markup is stable. Rehydrate
  // from localStorage after mount; any read error is swallowed so a corrupted
  // payload can never break the app — defaults are used instead.
  useEffect(() => {
    useStore.persist.rehydrate()?.catch?.(() => {})
  }, [])

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      {/* Main content */}
      <main className="lg:pl-[240px] min-h-dvh pb-[68px] lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="min-h-dvh"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
