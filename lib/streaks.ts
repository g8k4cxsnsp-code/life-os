import type { DayLog, Goal, Weekday } from '@/types'
import { toLocalDateString, getWeekStartString } from './date'
import { getWeekdayFromDate, isRestDay } from './schedule'
import type { UserSettings } from '@/types'

function getRequiredGoalIds(
  date: string,
  goals: Goal[],
  settings: UserSettings
): string[] {
  const d = new Date(date + 'T12:00:00')
  const weekday = getWeekdayFromDate(d)
  const isSunday = weekday === 'sunday'

  if (isSunday) {
    // Sunday only counts sleep + water as optional
    return []
  }

  return goals
    .filter((g) => {
      if (!g.active || g.cadence !== 'daily') return false
      if (!g.schedule) return true
      return g.schedule.includes(weekday)
    })
    .map((g) => g.id)
}

export function isDayComplete(
  date: string,
  log: DayLog | undefined,
  goals: Goal[],
  settings: UserSettings
): boolean {
  if (!log) return false
  const required = getRequiredGoalIds(date, goals, settings)
  if (required.length === 0) return true
  return required.every((id) => !!log.completed[id])
}

export function getCurrentStreak(
  history: Record<string, DayLog>,
  goals: Goal[],
  settings: UserSettings
): number {
  let streak = 0
  const today = toLocalDateString(new Date())
  let cursor = new Date()
  cursor.setDate(cursor.getDate() - 1) // start from yesterday

  while (true) {
    const dateStr = toLocalDateString(cursor)
    const log = history[dateStr]
    if (!isDayComplete(dateStr, log, goals, settings)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
    if (streak > 365) break
  }

  // Count today if complete
  const todayLog = history[today]
  if (isDayComplete(today, todayLog, goals, settings)) {
    streak++
  }

  return streak
}

export function getWeeklyCompletionPercent(
  history: Record<string, DayLog>,
  goals: Goal[],
  settings: UserSettings
): number {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))

  let total = 0
  let complete = 0

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    if (d > today) break
    const dateStr = toLocalDateString(d)
    const weekday = getWeekdayFromDate(d)
    if (weekday === 'sunday') continue

    const required = getRequiredGoalIds(dateStr, goals, settings)
    if (required.length === 0) continue

    total++
    const log = history[dateStr]
    if (isDayComplete(dateStr, log, goals, settings)) complete++
  }

  return total === 0 ? 0 : Math.round((complete / total) * 100)
}
