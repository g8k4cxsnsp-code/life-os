'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Target, Calendar, Dumbbell,
  UtensilsCrossed, Timer, Settings, Zap, Moon, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'
import { getCurrentStreak } from '@/lib/streaks'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/weekly', label: 'Weekly', icon: Target },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/fitness', label: 'Fitness', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { href: '/sleep', label: 'Sleep', icon: Moon },
  { href: '/timer', label: 'Timer', icon: Timer },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { history, goals, settings } = useStore()
  const streak = getCurrentStreak(history, goals, settings)

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] z-40 flex flex-col border-r border-white/[0.06] bg-[#07060B]/90 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#FF2D87] to-[#C026FF]">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-black text-sm tracking-wide">LIFE OS</p>
          <p className="text-white/40 text-xs">by Janco</p>
        </div>
        {streak > 0 && (
          <div className="ml-auto flex items-center gap-1 bg-[#FF2D87]/10 border border-[#FF2D87]/20 rounded-full px-2 py-0.5">
            <span className="text-xs">🔥</span>
            <span className="text-[#FF2D87] text-xs font-bold">{streak}</span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto hide-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  active
                    ? 'bg-[#FF2D87]/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#FF2D87] rounded-full"
                    style={{ boxShadow: '0 0 8px #FF2D87' }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    active ? 'text-[#FF2D87]' : 'text-current'
                  )}
                />
                <span className="text-sm font-medium">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF2D87]" style={{ boxShadow: '0 0 6px #FF2D87' }} />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/[0.06]">
        <p className="text-white/20 text-xs">All data stays on-device.</p>
      </div>
    </aside>
  )
}
