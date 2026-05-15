import type { UserProfile, UserTargets } from '@/types'

export type GoalBias = 'cut' | 'maintain' | 'bulk' | 'recomp'

export interface ComputedTargets {
  kcal: number
  protein: number
  carbs: number
  fat: number
  waterL: number
  steps: number
}

export function classifyGoalSentence(s: string): GoalBias {
  const lower = s.toLowerCase()
  if (/cut|lean|lose|shred|fat.?loss|deficit|slim|trim/.test(lower)) return 'cut'
  if (/bulk|gain|mass|size|build|grow|surplus/.test(lower)) return 'bulk'
  if (/recomp|tone|toned|maintain.?strength|body.?comp/.test(lower)) return 'recomp'
  return 'maintain'
}

export function computeBMR(p: UserProfile): number {
  // Mifflin–St Jeor
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  return p.sex === 'male' ? base + 5 : base - 161
}

export function activityMultiplier(daysPerWeek: number): number {
  if (daysPerWeek <= 0) return 1.2
  if (daysPerWeek <= 2) return 1.375
  if (daysPerWeek <= 4) return 1.55
  if (daysPerWeek <= 6) return 1.725
  return 1.9
}

export function computeTargets(p: UserProfile, bias: GoalBias): ComputedTargets {
  const bmr = computeBMR(p)
  const maintenance = Math.round(bmr * activityMultiplier(p.trainingDaysPerWeek))

  let kcal: number
  if (bias === 'cut') kcal = maintenance - 400
  else if (bias === 'bulk') kcal = maintenance + 300
  else if (bias === 'recomp') kcal = maintenance - 150
  else kcal = maintenance
  kcal = Math.round(kcal / 10) * 10

  const protein = Math.round((bias === 'cut' || bias === 'recomp' ? 2.0 : 1.8) * p.weightKg)
  const fat = Math.max(Math.round(0.8 * p.weightKg), Math.round(0.6 * p.weightKg))
  const carbKcal = kcal - protein * 4 - fat * 9
  const carbs = Math.max(Math.round(carbKcal / 4), 0)

  const waterL = Math.min(Math.max(Math.round(0.033 * p.weightKg * 10) / 10, 2.0), 4.5)

  let steps = 8000 + 500 * p.trainingDaysPerWeek
  if (bias === 'cut') steps += 1000
  steps = Math.min(Math.max(steps, 7000), 12000)

  return { kcal, protein, carbs, fat, waterL, steps }
}

export function targetsAreClose(a: ComputedTargets, b: UserTargets): boolean {
  return (
    Math.abs(a.kcal - b.kcal) <= 25 &&
    Math.abs(a.protein - b.protein) <= 3 &&
    Math.abs(a.carbs - b.carbs) <= 3 &&
    Math.abs(a.fat - b.fat) <= 3 &&
    Math.abs(a.waterL - b.waterL) <= 0.1 &&
    Math.abs(a.steps - b.steps) <= 250
  )
}
