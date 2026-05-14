'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Target, Calendar, Dumbbell, MoreHorizontal,
  UtensilsCrossed, Timer, Settings, Moon, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useState } from 'react'

const PRIMARY_NAV = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/nutrition', label: 'Food', icon: UtensilsCrossed },
  { href: '/sleep', label: 'Sleep', icon: Moon },
]

const MORE_NAV = [
  { href: '/weekly', label: 'Goals', icon: Target },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/fitness', label: 'Fitness', icon: Dumbbell },
  { href: '/timer', label: 'Timer', icon: Timer },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const isMoreActive = MORE_NAV.some((n) => n.href === pathname)

  return (
    <>
      {/* More drawer */}
      {moreOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-[68px] left-0 right-0 z-40 glass-card border-t border-white/[0.08] p-4"
        >
          <div className="grid grid-cols-3 gap-3">
            {MORE_NAV.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all',
                    active ? 'bg-[#FF2D87]/10 text-[#FF2D87]' : 'text-white/50 hover:text-white/80'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Backdrop */}
      {moreOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMoreOpen(false)} />
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[68px] glass-card border-t border-white/[0.06] flex items-center justify-around px-2 pb-safe">
        {PRIMARY_NAV.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 py-1"
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      active ? 'text-[#FF2D87]' : 'text-white/40'
                    )}
                  />
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF2D87]"
                      style={{ boxShadow: '0 0 6px #FF2D87' }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    active ? 'text-[#FF2D87]' : 'text-white/30'
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}

        {/* More button */}
        <button className="flex-1" onClick={() => setMoreOpen(!moreOpen)}>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 py-1"
          >
            <MoreHorizontal
              className={cn(
                'w-5 h-5 transition-colors',
                (isMoreActive || moreOpen) ? 'text-[#FF2D87]' : 'text-white/40'
              )}
            />
            <span
              className={cn(
                'text-[10px] font-medium transition-colors',
                (isMoreActive || moreOpen) ? 'text-[#FF2D87]' : 'text-white/30'
              )}
            >
              More
            </span>
          </motion.div>
        </button>
      </nav>
    </>
  )
}
