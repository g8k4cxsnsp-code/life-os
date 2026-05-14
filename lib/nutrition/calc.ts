import type { MealEntry, UserTargets } from '@/types'

export interface DayMacros {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export function sumMacros(meals: MealEntry[]): DayMacros {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export function getMacroPercent(value: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((value / target) * 100), 100)
}

export function formatMacro(value: number): string {
  return value < 10 ? value.toFixed(1) : Math.round(value).toString()
}
