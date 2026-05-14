// ── Core Enums & Unions ───────────────────────────────────────────────────

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type CategoryId = 'discipline' | 'fitness' | 'faith' | 'business' | 'recovery' | 'custom'

export type WorkoutType = 'calisthenics' | 'weights' | 'optional-cardio' | 'rest'

export type NeonColor =
  | '#FF2D87'  // pink — discipline
  | '#00E5FF'  // cyan — fitness
  | '#C6FF3D'  // lime — completed / steps
  | '#C026FF'  // magenta — business
  | '#7A5CFF'  // violet — sleep / recovery
  | '#FFB020'  // amber — faith
  | '#FF6B35'  // orange — custom
  | string

// ── Goals ─────────────────────────────────────────────────────────────────

export interface Goal {
  id: string
  title: string
  category: CategoryId
  color: NeonColor
  cadence: 'daily' | 'weekly'
  schedule?: Weekday[]        // undefined = every applicable day
  targetValue?: number
  unit?: string
  active: boolean
  createdAt: string           // ISO
  order: number
}

// ── Day History ───────────────────────────────────────────────────────────

export interface DayLog {
  date: string                // YYYY-MM-DD local
  completed: Record<string, boolean | number>   // goalId → done / value
  notes?: string
  waterL?: number
  sleepH?: number
  sleepRating?: number        // 0–100, subjective quality of last night's sleep
  steps?: number
  kcal?: number
}

// ── Weekly Goals ──────────────────────────────────────────────────────────

export interface WeeklyGoal {
  id: string
  title: string
  color: NeonColor
  targetCount: number         // usually 1
  active: boolean
  createdAt: string
}

export interface WeeklyLog {
  weekStart: string           // YYYY-MM-DD of Monday
  completed: Record<string, number>  // goalId → times completed
}

// ── Fitness ───────────────────────────────────────────────────────────────

export interface Lift {
  id: string
  name: string
  unit: 'kg' | 'reps' | 'bw'
  category: 'barbell' | 'bodyweight' | 'dumbbell' | 'machine' | 'cardio'
  active: boolean
  createdAt: string
}

export interface LiftSet {
  id: string
  liftId: string
  date: string                // YYYY-MM-DD
  weight?: number
  reps: number
  rpe?: number                // 1–10
}

export interface BodyweightEntry {
  id: string
  date: string
  kg: number
}

export interface PR {
  liftId: string
  date: string
  weight?: number
  reps: number
  estimated1RM: number
}

// ── Nutrition ─────────────────────────────────────────────────────────────

export type FoodUnit = 'g' | 'kg' | 'ml' | 'l' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'slice' | 'piece' | 'item' | 'serving'

export interface FoodItem {
  id: string
  name: string
  aliases: string[]
  per: 'item' | '100g' | '100ml'
  kcal: number
  protein: number
  carbs: number
  fat: number
  defaultQty?: number         // grams per item (e.g. banana = 118)
  custom?: boolean
}

export interface MealEntry {
  id: string
  date: string                // YYYY-MM-DD
  foodId?: string
  freeText?: string
  qty: number
  unit: FoodUnit
  kcal: number
  protein: number
  carbs: number
  fat: number
  addedAt: string             // ISO
}

export interface ParsedFoodChunk {
  raw: string
  qty: number
  unit: FoodUnit
  foodQuery: string
  match?: FoodItem
  confidence: number          // 0–1
  kcal: number
  protein: number
  carbs: number
  fat: number
}

// ── Timer ─────────────────────────────────────────────────────────────────

export type TimerMode = 'countdown' | 'stopwatch' | 'rest' | 'focus'

export interface TimerPreset {
  id: string
  label: string
  seconds: number
  color: NeonColor
}

// ── Settings ──────────────────────────────────────────────────────────────

export interface UserTargets {
  kcal: number
  protein: number
  carbs: number
  fat: number
  waterL: number
  steps: number
  sleepH: number
}

export interface UserSettings {
  name: string
  wakeTime: string            // 'HH:MM'
  height: number              // cm
  startingWeight: number      // kg
  schedule: Record<Weekday, WorkoutType>
  targets: UserTargets
  timerSound: boolean
  timerVibration: boolean
  reducedMotion: boolean
}

// ── Store ─────────────────────────────────────────────────────────────────

export interface AppStore {
  version: number
  settings: UserSettings
  goals: Goal[]
  weeklyGoals: WeeklyGoal[]
  history: Record<string, DayLog>            // keyed by YYYY-MM-DD
  weeklyHistory: Record<string, WeeklyLog>   // keyed by weekStart
  lifts: Lift[]
  liftSets: LiftSet[]
  bodyweight: BodyweightEntry[]
  meals: MealEntry[]          // all time (indexed by date in queries)
  customFoods: FoodItem[]
}
