'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useStore, useTodayLog, useTodayGoals, useTodayMeals } from '@/lib/store'
import { getSuggestions } from '@/lib/suggestions/rules'
import { toLocalDateString } from '@/lib/date'
import { DEFAULT_SETTINGS } from '@/lib/store/defaults'
import type { DayLog, Goal, MealEntry, UserSettings } from '@/types'

const STORAGE_KEY_PREFIX = 'suggestion-fired:'

function getFiredIds(date: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${date}`)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function markFired(date: string, id: string) {
  try {
    const fired = getFiredIds(date)
    fired.add(id)
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${date}`, JSON.stringify([...fired]))
  } catch {}
}

interface StateSnapshot {
  settings: UserSettings
  todayLog: DayLog
  todayGoals: Goal[]
  meals: MealEntry[]
}

export function SuggestionEngine() {
  const { settings } = useStore()
  const todayLog = useTodayLog()
  const todayGoals = useTodayGoals()
  const meals = useTodayMeals()

  const stateRef = useRef<StateSnapshot>({ settings, todayLog, todayGoals, meals })
  stateRef.current = { settings, todayLog, todayGoals, meals }

  useEffect(() => {
    function check() {
      const { settings, todayLog, todayGoals, meals } = stateRef.current
      const now = new Date()
      const today = toLocalDateString(now)
      const fired = getFiredIds(today)

      const completedGoalIds = new Set(
        Object.entries(todayLog.completed)
          .filter(([, v]) => !!v)
          .map(([k]) => k)
      )

      const suggestions = getSuggestions({
        log: todayLog,
        todayGoals,
        completedGoalIds,
        meals,
        now,
        waterTarget: settings?.targets?.waterL ?? DEFAULT_SETTINGS.targets.waterL,
      })

      for (const s of suggestions) {
        if (!fired.has(s.id)) {
          toast(s.message, {
            duration: 8000,
            style: {
              background: 'rgba(14,11,22,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
            },
          })
          markFired(today, s.id)
          break // one toast at a time
        }
      }
    }

    const timer = setTimeout(check, 3000)
    const interval = setInterval(check, 15 * 60 * 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  return null
}
