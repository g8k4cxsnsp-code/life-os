'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek,
  endOfWeek, format, isSameMonth, isSameDay, parseISO, addMonths, subMonths
} from 'date-fns'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { useStore } from '@/lib/store'
import { toLocalDateString } from '@/lib/date'
import { isDayComplete } from '@/lib/streaks'
import { GlassCard } from '@/components/ui/GlassCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { getWeekdayFromDate } from '@/lib/schedule'
import { cn } from '@/lib/cn'
import type { DayLog, Goal, UserSettings } from '@/types'

function getDayStatus(
  dateStr: string,
  history: Record<string, DayLog>,
  goals: Goal[],
  settings: UserSettings
): 'complete' | 'missed' | 'future' | 'today' | 'rest' {
  const today = toLocalDateString(new Date())
  const weekday = getWeekdayFromDate(new Date(dateStr + 'T12:00:00'))

  if (dateStr === today) return 'today'
  if (dateStr > today) return 'future'
  if (weekday === 'sunday') return 'rest'

  const log = history[dateStr]
  return isDayComplete(dateStr, log, goals, settings) ? 'complete' : 'missed'
}

export default function CalendarPage() {
  const { history: historyRaw, goals: goalsRaw, settings, setDayNotes } = useStore()
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const today = new Date()

  const history = historyRaw && typeof historyRaw === 'object' ? historyRaw : {}
  const goals = Array.isArray(goalsRaw) ? goalsRaw : []

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  const selectedLog = selectedDate ? (history[selectedDate] ?? { date: selectedDate, completed: {} }) : null
  const selectedGoals = selectedDate
    ? goals.filter((g) => g.active && g.cadence === 'daily' && (() => {
        const weekday = getWeekdayFromDate(new Date(selectedDate + 'T12:00:00'))
        if (!Array.isArray(g.schedule)) return true
        return g.schedule.includes(weekday)
      })())
    : []

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <PageHeader title="Calendar" subtitle="Your daily completion history" />

        <GlassCard className="p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-black text-white text-sm">
              {format(viewDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-white/25 text-xs font-semibold py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calDays.map((day) => {
              const dateStr = toLocalDateString(day)
              const status = getDayStatus(dateStr, history, goals, settings)
              const inMonth = isSameMonth(day, viewDate)
              const isToday = isSameDay(day, today)
              const isSelected = dateStr === selectedDate

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-xl py-2 gap-0.5 transition-all',
                    inMonth ? 'opacity-100' : 'opacity-20',
                    isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                  )}
                >
                  <span className={cn(
                    'text-xs font-semibold',
                    isToday ? 'text-[#FF2D87]' : 'text-white/70'
                  )}>
                    {format(day, 'd')}
                  </span>

                  {/* Status dot */}
                  {inMonth && (
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
                    )} style={{
                      background: status === 'complete' ? '#C6FF3D' :
                        status === 'missed' ? '#FF2D87' :
                          status === 'rest' ? '#7A5CFF' :
                            status === 'today' ? '#FF2D87' :
                              'rgba(255,255,255,0.1)',
                      boxShadow: status === 'complete' ? '0 0 6px #C6FF3D' :
                        status === 'missed' ? '0 0 6px #FF2D87' :
                          status === 'rest' ? '0 0 4px #7A5CFF' :
                            status === 'today' ? '0 0 6px #FF2D87' : undefined,
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-white/[0.06]">
            {[
              { color: '#C6FF3D', label: 'Complete' },
              { color: '#FF2D87', label: 'Missed' },
              { color: '#7A5CFF', label: 'Rest' },
              { color: 'rgba(255,255,255,0.15)', label: 'Future' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-white/30 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Day drawer */}
        <AnimatePresence>
          {selectedDate && selectedLog && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
            >
              <GlassCard glow="#FF2D87" className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base">
                    {format(parseISO(selectedDate + 'T12:00:00'), 'EEEE, MMM d')}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Goals breakdown */}
                {selectedGoals.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGoals.map((goal) => {
                      const done = !!selectedLog.completed[goal.id]
                      return (
                        <div key={goal.id} className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: done ? goal.color : 'transparent',
                              border: `1.5px solid ${goal.color}${done ? 'ff' : '50'}`,
                            }}
                          >
                            {done && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                          </div>
                          <span className={cn('text-sm', done ? 'text-white/60 line-through' : 'text-white/80')}>
                            {goal.title}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm">Rest day — no goals required.</p>
                )}

                {/* Notes */}
                <div>
                  <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Notes</p>
                  <textarea
                    value={selectedLog.notes ?? ''}
                    onChange={(e) => setDayNotes(selectedDate, e.target.value)}
                    placeholder="How did today go?"
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/80 placeholder-white/20 text-sm resize-none focus:outline-none focus:border-[#FF2D87]/40"
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
