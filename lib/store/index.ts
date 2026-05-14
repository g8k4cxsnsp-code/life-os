'use client'

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AppStore, Goal, WeeklyGoal, DayLog, WeeklyLog,
  Lift, LiftSet, BodyweightEntry, MealEntry, FoodItem,
  UserSettings, CategoryId, Weekday, WorkoutType, FoodUnit, UserTargets,
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

// ── Persisted-state sanitization ──────────────────────────────────────────
// Defensive validators that turn ANY incoming JSON into a known-good shape
// or drop it. We never trust localStorage; older deploys may have written
// values with the wrong types or shapes.

const WEEKDAY_SET = new Set<Weekday>([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
])
const WORKOUT_SET = new Set<WorkoutType>(['calisthenics', 'weights', 'optional-cardio', 'rest'])
const CATEGORY_SET = new Set<CategoryId>(['discipline', 'fitness', 'faith', 'business', 'recovery', 'custom'])
const FOOD_UNIT_SET = new Set<FoodUnit>(['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'slice', 'piece', 'item', 'serving'])

const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown, fallback: string): string => (typeof v === 'string' ? v : fallback)
const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback
const optNum = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined
const optStr = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback)

function sanitizeGoal(input: unknown, fallbackOrder: number): Goal | null {
  if (!isObj(input)) return null
  const id = optStr(input.id)
  const title = optStr(input.title)
  if (!id || !title) return null
  const category = CATEGORY_SET.has(input.category as CategoryId) ? (input.category as CategoryId) : 'custom'
  const cadence: 'daily' | 'weekly' = input.cadence === 'weekly' ? 'weekly' : 'daily'
  const schedule = Array.isArray(input.schedule)
    ? (input.schedule.filter((d): d is Weekday => typeof d === 'string' && WEEKDAY_SET.has(d as Weekday)))
    : undefined
  return {
    id,
    title,
    category,
    color: str(input.color, '#FF2D87'),
    cadence,
    schedule,
    targetValue: optNum(input.targetValue),
    unit: optStr(input.unit),
    active: bool(input.active, true),
    createdAt: str(input.createdAt, new Date().toISOString()),
    order: num(input.order, fallbackOrder),
  }
}

function sanitizeWeeklyGoal(input: unknown): WeeklyGoal | null {
  if (!isObj(input)) return null
  const id = optStr(input.id)
  const title = optStr(input.title)
  if (!id || !title) return null
  return {
    id,
    title,
    color: str(input.color, '#FF2D87'),
    targetCount: Math.max(1, num(input.targetCount, 1)),
    active: bool(input.active, true),
    createdAt: str(input.createdAt, new Date().toISOString()),
  }
}

function sanitizeLift(input: unknown): Lift | null {
  if (!isObj(input)) return null
  const id = optStr(input.id)
  const name = optStr(input.name)
  if (!id || !name) return null
  const unit: Lift['unit'] =
    input.unit === 'reps' || input.unit === 'bw' ? input.unit : 'kg'
  const validCats: Lift['category'][] = ['barbell', 'bodyweight', 'dumbbell', 'machine', 'cardio']
  const category: Lift['category'] = (validCats as string[]).includes(input.category as string)
    ? (input.category as Lift['category'])
    : 'barbell'
  return {
    id, name, unit, category,
    active: bool(input.active, true),
    createdAt: str(input.createdAt, new Date().toISOString()),
  }
}

function sanitizeLiftSet(input: unknown): LiftSet | null {
  if (!isObj(input)) return null
  const id = optStr(input.id)
  const liftId = optStr(input.liftId)
  const date = optStr(input.date)
  const reps = optNum(input.reps)
  if (!id || !liftId || !date || reps === undefined) return null
  return {
    id, liftId, date, reps,
    weight: optNum(input.weight),
    rpe: optNum(input.rpe),
  }
}

function sanitizeBodyweight(input: unknown): BodyweightEntry | null {
  if (!isObj(input)) return null
  const id = optStr(input.id)
  const date = optStr(input.date)
  const kg = optNum(input.kg)
  if (!id || !date || kg === undefined) return null
  return { id, date, kg }
}

function sanitizeMeal(input: unknown): MealEntry | null {
  if (!isObj(input)) return null
  const id = optStr(input.id)
  const date = optStr(input.date)
  if (!id || !date) return null
  const unit: FoodUnit = FOOD_UNIT_SET.has(input.unit as FoodUnit) ? (input.unit as FoodUnit) : 'g'
  return {
    id, date, unit,
    foodId: optStr(input.foodId),
    freeText: optStr(input.freeText),
    qty: num(input.qty, 0),
    kcal: num(input.kcal, 0),
    protein: num(input.protein, 0),
    carbs: num(input.carbs, 0),
    fat: num(input.fat, 0),
    addedAt: str(input.addedAt, new Date().toISOString()),
  }
}

function sanitizeFood(input: unknown): FoodItem | null {
  if (!isObj(input)) return null
  const id = optStr(input.id)
  const name = optStr(input.name)
  if (!id || !name) return null
  const per: FoodItem['per'] =
    input.per === '100g' || input.per === '100ml' || input.per === 'item' ? input.per : 'item'
  return {
    id, name, per,
    aliases: Array.isArray(input.aliases) ? input.aliases.filter((a): a is string => typeof a === 'string') : [],
    kcal: num(input.kcal, 0),
    protein: num(input.protein, 0),
    carbs: num(input.carbs, 0),
    fat: num(input.fat, 0),
    defaultQty: optNum(input.defaultQty),
    custom: bool(input.custom, true),
  }
}

function sanitizeDayLog(input: unknown): DayLog | null {
  if (!isObj(input)) return null
  const date = optStr(input.date)
  if (!date) return null
  const completedIn = isObj(input.completed) ? input.completed : {}
  const completed: Record<string, boolean | number> = {}
  for (const [k, v] of Object.entries(completedIn)) {
    if (typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))) {
      completed[k] = v
    }
  }
  return {
    date,
    completed,
    notes: optStr(input.notes),
    waterL: optNum(input.waterL),
    sleepH: optNum(input.sleepH),
    sleepRating: optNum(input.sleepRating),
    steps: optNum(input.steps),
    kcal: optNum(input.kcal),
  }
}

function sanitizeWeeklyLog(input: unknown): WeeklyLog | null {
  if (!isObj(input)) return null
  const weekStart = optStr(input.weekStart)
  if (!weekStart) return null
  const completedIn = isObj(input.completed) ? input.completed : {}
  const completed: Record<string, number> = {}
  for (const [k, v] of Object.entries(completedIn)) {
    if (typeof v === 'number' && Number.isFinite(v)) completed[k] = v
  }
  return { weekStart, completed }
}

function sanitizeTargets(input: unknown, fallback: UserTargets): UserTargets {
  const x = isObj(input) ? input : {}
  return {
    kcal: num(x.kcal, fallback.kcal),
    protein: num(x.protein, fallback.protein),
    carbs: num(x.carbs, fallback.carbs),
    fat: num(x.fat, fallback.fat),
    waterL: num(x.waterL, fallback.waterL),
    steps: num(x.steps, fallback.steps),
    sleepH: num(x.sleepH, fallback.sleepH),
  }
}

function sanitizeSchedule(input: unknown, fallback: Record<Weekday, WorkoutType>): Record<Weekday, WorkoutType> {
  const x = isObj(input) ? input : {}
  const out = { ...fallback }
  for (const day of WEEKDAY_SET) {
    const v = x[day]
    if (typeof v === 'string' && WORKOUT_SET.has(v as WorkoutType)) {
      out[day] = v as WorkoutType
    }
  }
  return out
}

function sanitizeSettings(input: unknown, fallback: UserSettings): UserSettings {
  const x = isObj(input) ? input : {}
  return {
    name: str(x.name, fallback.name),
    wakeTime: str(x.wakeTime, fallback.wakeTime),
    height: num(x.height, fallback.height),
    startingWeight: num(x.startingWeight, fallback.startingWeight),
    schedule: sanitizeSchedule(x.schedule, fallback.schedule),
    targets: sanitizeTargets(x.targets, fallback.targets),
    timerSound: bool(x.timerSound, fallback.timerSound),
    timerVibration: bool(x.timerVibration, fallback.timerVibration),
    reducedMotion: bool(x.reducedMotion, fallback.reducedMotion),
  }
}

function sanitizeArray<T>(input: unknown, fallback: T[], one: (v: unknown, i: number) => T | null): T[] {
  if (!Array.isArray(input)) return fallback
  const out: T[] = []
  for (let i = 0; i < input.length; i++) {
    const v = one(input[i], i)
    if (v) out.push(v)
  }
  return out
}

function sanitizeRecord<T>(input: unknown, one: (v: unknown) => T | null): Record<string, T> {
  if (!isObj(input)) return {}
  const out: Record<string, T> = {}
  for (const [k, v] of Object.entries(input)) {
    const sanitized = one(v)
    if (sanitized) out[k] = sanitized
  }
  return out
}

function sanitizeMerge(persisted: unknown, current: FullStore): FullStore {
  try {
    const p = isObj(persisted) ? persisted : {}
    return {
      ...current,
      version: 2,
      settings: sanitizeSettings(p.settings, current.settings),
      goals: sanitizeArray(p.goals, current.goals, (v, i) => sanitizeGoal(v, i)),
      weeklyGoals: sanitizeArray(p.weeklyGoals, current.weeklyGoals, sanitizeWeeklyGoal),
      lifts: sanitizeArray(p.lifts, current.lifts, sanitizeLift),
      liftSets: sanitizeArray(p.liftSets, current.liftSets, sanitizeLiftSet),
      bodyweight: sanitizeArray(p.bodyweight, current.bodyweight, sanitizeBodyweight),
      meals: sanitizeArray(p.meals, current.meals, sanitizeMeal),
      customFoods: sanitizeArray(p.customFoods, current.customFoods, sanitizeFood),
      history: sanitizeRecord(p.history, sanitizeDayLog),
      weeklyHistory: sanitizeRecord(p.weeklyHistory, sanitizeWeeklyLog),
    }
  } catch {
    return current
  }
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
      // v2 introduces strict item sanitization in `merge`. Anything older is
      // discarded entirely — we'd rather start the user clean than carry
      // shape bugs forward. The app launched this week, so no real data is
      // at risk.
      version: 2,
      skipHydration: true,
      migrate: (persistedState: unknown, fromVersion: number) => {
        if (fromVersion < 2 || !persistedState || typeof persistedState !== 'object') {
          return INITIAL_STATE as FullStore
        }
        return persistedState as FullStore
      },
      // Deep, item-level sanitization. Every persisted value is validated
      // and coerced to a safe shape — malformed items are filtered out
      // rather than passed through to component code where they'd crash.
      merge: (persisted, current) => sanitizeMerge(persisted, current),
    }
  )
)

// ── Selectors ─────────────────────────────────────────────────────────────
// IMPORTANT: Zustand subscribes by reference. A selector that returns a new
// array on every call (e.g. `s.goals.filter(...)`) breaks getSnapshot's
// stability and triggers React error #185 ("Maximum update depth exceeded")
// — an infinite re-render loop. So we select the *raw* arrays here and
// derive in render via useMemo.

export function useTodayLog() {
  const date = toLocalDateString(new Date())
  const history = useStore((s) => s.history)
  return useMemo(
    () => history[date] ?? { date, completed: {} },
    [history, date],
  )
}

export function useTodayGoals() {
  const goals = useStore((s) => s.goals)
  const weekday = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as Weekday
  return useMemo(() => {
    if (!Array.isArray(goals)) return []
    return goals
      .filter((g) => {
        if (!g || !g.active || g.cadence !== 'daily') return false
        // Treat missing OR empty schedule as "every day". An empty array can
        // happen after sanitization drops invalid weekday strings from old
        // persisted payloads, and silently hiding the goal forever is worse
        // than showing it daily.
        if (!Array.isArray(g.schedule) || g.schedule.length === 0) return true
        return g.schedule.includes(weekday)
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [goals, weekday])
}

export function useTodayMeals() {
  const meals = useStore((s) => s.meals)
  const date = toLocalDateString(new Date())
  return useMemo(() => {
    if (!Array.isArray(meals)) return []
    return meals.filter((m) => m && m.date === date)
  }, [meals, date])
}
