'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AppStore, Goal, WeeklyGoal, DayLog, WeeklyLog,
  Lift, LiftSet, BodyweightEntry, MealEntry, FoodItem,
  UserSettings
} from '@/types'
import { DEFAULT_GOALS, DEFAULT_LIFTS, DEFAULT_SETTINGS, DEFAULT_WEEKLY_GOALS } from './defaults'
import { toLocalDateString } from '@/lib/date'

// ── State + Actions ───────────────────────────────────────────────────────

interface StoreActions {
  // Settings
  updateSettings: (patch: Partial<UserSettings>) => void

  // Goals
  toggleGoal: (goalId: string, date: string) => void
  setGoalValue: (goalId: string, date: string, value: number) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  removeGoal: (id: string) => void
  reorderGoals: (ids: string[]) => void

  // Weekly goals
  toggleWeeklyGoal: (goalId: string, weekStart: string) => void
  addWeeklyGoal: (goal: WeeklyGoal) => void
  updateWeeklyGoal: (id: string, patch: Partial<WeeklyGoal>) => void
  removeWeeklyGoal: (id: string) => void

  // Day notes
  setDayNotes: (date: string, notes: string) => void
  updateDayLog: (date: string, patch: Partial<DayLog>) => void

  // Fitness
  addLiftSet: (set: LiftSet) => void
  removeLiftSet: (id: string) => void
  addLift: (lift: Lift) => void
  updateLift: (id: string, patch: Partial<Lift>) => void
  removeLift: (id: string) => void
  addBodyweight: (entry: BodyweightEntry) => void
  removeBodyweight: (id: string) => void

  // Nutrition
  addMealEntry: (entry: MealEntry) => void
  removeMealEntry: (id: string) => void
  updateMealEntry: (id: string, patch: Partial<MealEntry>) => void
  addCustomFood: (food: FoodItem) => void
  updateCustomFood: (id: string, patch: Partial<FoodItem>) => void
  removeCustomFood: (id: string) => void

  // Data management
  importData: (data: Partial<AppStore>) => void
  resetAll: () => void
}

type FullStore = AppStore & StoreActions

const INITIAL_STATE: AppStore = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  goals: DEFAULT_GOALS,
  weeklyGoals: DEFAULT_WEEKLY_GOALS,
  history: {},
  weeklyHistory: {},
  lifts: DEFAULT_LIFTS,
  liftSets: [],
  bodyweight: [],
  meals: [],
  customFoods: [],
}

function ensureDayLog(history: Record<string, DayLog>, date: string): DayLog {
  return history[date] ?? { date, completed: {} }
}

function ensureWeeklyLog(weeklyHistory: Record<string, WeeklyLog>, weekStart: string): WeeklyLog {
  return weeklyHistory[weekStart] ?? { weekStart, completed: {} }
}

export const useStore = create<FullStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      toggleGoal: (goalId, date) =>
        set((s) => {
          const log = ensureDayLog(s.history, date)
          const current = log.completed[goalId]
          return {
            history: {
              ...s.history,
              [date]: {
                ...log,
                completed: {
                  ...log.completed,
                  [goalId]: !current,
                },
              },
            },
          }
        }),

      setGoalValue: (goalId, date, value) =>
        set((s) => {
          const log = ensureDayLog(s.history, date)
          return {
            history: {
              ...s.history,
              [date]: {
                ...log,
                completed: { ...log.completed, [goalId]: value },
              },
            },
          }
        }),

      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      reorderGoals: (ids) =>
        set((s) => {
          const map = new Map(s.goals.map((g) => [g.id, g]))
          return { goals: ids.map((id, i) => ({ ...map.get(id)!, order: i })).filter(Boolean) }
        }),

      toggleWeeklyGoal: (goalId, weekStart) =>
        set((s) => {
          const log = ensureWeeklyLog(s.weeklyHistory, weekStart)
          const current = log.completed[goalId] ?? 0
          const goal = s.weeklyGoals.find((g) => g.id === goalId)
          const max = goal?.targetCount ?? 1
          const next = current >= max ? 0 : current + 1
          return {
            weeklyHistory: {
              ...s.weeklyHistory,
              [weekStart]: {
                ...log,
                completed: { ...log.completed, [goalId]: next },
              },
            },
          }
        }),

      addWeeklyGoal: (goal) =>
        set((s) => ({ weeklyGoals: [...s.weeklyGoals, goal] })),
      updateWeeklyGoal: (id, patch) =>
        set((s) => ({
          weeklyGoals: s.weeklyGoals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      removeWeeklyGoal: (id) =>
        set((s) => ({ weeklyGoals: s.weeklyGoals.filter((g) => g.id !== id) })),

      setDayNotes: (date, notes) =>
        set((s) => {
          const log = ensureDayLog(s.history, date)
          return { history: { ...s.history, [date]: { ...log, notes } } }
        }),

      updateDayLog: (date, patch) =>
        set((s) => {
          const log = ensureDayLog(s.history, date)
          return { history: { ...s.history, [date]: { ...log, ...patch } } }
        }),

      addLiftSet: (liftSet) =>
        set((s) => ({ liftSets: [...s.liftSets, liftSet] })),
      removeLiftSet: (id) =>
        set((s) => ({ liftSets: s.liftSets.filter((l) => l.id !== id) })),
      addLift: (lift) => set((s) => ({ lifts: [...s.lifts, lift] })),
      updateLift: (id, patch) =>
        set((s) => ({
          lifts: s.lifts.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      removeLift: (id) =>
        set((s) => ({ lifts: s.lifts.filter((l) => l.id !== id) })),
      addBodyweight: (entry) =>
        set((s) => ({
          bodyweight: [...s.bodyweight.filter((b) => b.date !== entry.date), entry].sort(
            (a, b) => a.date.localeCompare(b.date)
          ),
        })),
      removeBodyweight: (id) =>
        set((s) => ({ bodyweight: s.bodyweight.filter((b) => b.id !== id) })),

      addMealEntry: (entry) =>
        set((s) => ({ meals: [...s.meals, entry] })),
      removeMealEntry: (id) =>
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
      updateMealEntry: (id, patch) =>
        set((s) => ({
          meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      addCustomFood: (food) =>
        set((s) => ({ customFoods: [...s.customFoods, food] })),
      updateCustomFood: (id, patch) =>
        set((s) => ({
          customFoods: s.customFoods.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),
      removeCustomFood: (id) =>
        set((s) => ({ customFoods: s.customFoods.filter((f) => f.id !== id) })),

      importData: (data) => set((s) => ({ ...s, ...data })),

      resetAll: () => set(INITIAL_STATE),
    }),
    {
      name: 'life-os:v1',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        return localStorage
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        // Future migrations go here
        return persistedState as FullStore
      },
    }
  )
)

// ── Selectors ─────────────────────────────────────────────────────────────

export function useTodayLog() {
  const date = toLocalDateString(new Date())
  return useStore((s) => s.history[date] ?? { date, completed: {} })
}

export function useTodayGoals() {
  const today = new Date()
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as import('@/types').Weekday
  return useStore((s) =>
    s.goals.filter((g) => {
      if (!g.active || g.cadence !== 'daily') return false
      if (!g.schedule) return true
      return g.schedule.includes(weekday)
    }).sort((a, b) => a.order - b.order)
  )
}

export function useTodayMeals() {
  const date = toLocalDateString(new Date())
  return useStore((s) => s.meals.filter((m) => m.date === date))
}
