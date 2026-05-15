import type { UserTargets } from '@/types'
import type { GoalBias } from './targets-engine'

export interface Nudge {
  id: string
  tone: 'info' | 'warn' | 'good'
  text: string
}

interface NudgeArgs {
  totals: { kcal: number; protein: number; carbs: number; fat: number }
  targets: UserTargets
  bias: GoalBias
  hourOfDay: number
  waterL: number
  waterTarget: number
}

export function buildNudges({ totals, targets, bias, hourOfDay, waterL, waterTarget }: NudgeArgs): Nudge[] {
  const nudges: Nudge[] = []

  const fatPct = targets.fat > 0 ? totals.fat / targets.fat : 0
  const proteinPct = targets.protein > 0 ? totals.protein / targets.protein : 0
  const kcalPct = targets.kcal > 0 ? totals.kcal / targets.kcal : 0
  const waterPct = waterTarget > 0 ? waterL / waterTarget : 0

  const proteinNeeded = Math.round(targets.protein - totals.protein)
  const kcalOver = Math.round(totals.kcal - targets.kcal)
  const kcalUnder = Math.round(targets.kcal - totals.kcal)
  const glassesNeeded = Math.round((waterTarget - waterL) / 0.25)

  // Fat approaching cap with kcal still to spend
  if (fatPct >= 0.95 && kcalPct < 0.70) {
    nudges.push({
      id: 'fat-cap',
      tone: 'warn',
      text: `Easy on the fats — you're close to the daily cap with calories still to spend.`,
    })
  }

  // Protein lagging after midday
  if (proteinPct < 0.60 && hourOfDay >= 14 && proteinNeeded > 0) {
    nudges.push({
      id: 'protein-lag',
      tone: 'warn',
      text: `Protein's lagging — aim for ~${proteinNeeded}g more before the day's out.`,
    })
  }

  // Over cut target
  if (kcalPct >= 1.10 && bias === 'cut') {
    nudges.push({
      id: 'kcal-over-cut',
      tone: 'warn',
      text: `Over your cut target by ${kcalOver} kcal — consider a lighter dinner.`,
    })
  }

  // Light eating late (not a cut)
  if (kcalPct < 0.70 && hourOfDay >= 19 && bias !== 'cut') {
    nudges.push({
      id: 'kcal-light',
      tone: 'info',
      text: `You've eaten light today — ${kcalUnder} kcal under target if that's intentional.`,
    })
  }

  // Bulk needs more food
  if (bias === 'bulk' && kcalPct < 0.90 && hourOfDay >= 19) {
    nudges.push({
      id: 'bulk-low',
      tone: 'warn',
      text: `Calories light for a bulk day — you're ${kcalUnder} kcal short. Grab a snack.`,
    })
  }

  // Hydration check after midday
  if (waterPct < 0.50 && hourOfDay >= 14 && glassesNeeded > 0) {
    nudges.push({
      id: 'water-low',
      tone: 'warn',
      text: `Hydration check — ${glassesNeeded} glass${glassesNeeded !== 1 ? 'es' : ''} to hit your water goal.`,
    })
  }

  // Protein nailed on a cut and within calories
  if (proteinPct >= 1.0 && kcalPct < 1.0 && bias === 'cut') {
    nudges.push({
      id: 'protein-nailed-cut',
      tone: 'good',
      text: `Protein nailed. Good cut day.`,
    })
  }

  // Everything on track
  if (
    nudges.length === 0 &&
    kcalPct >= 0.80 &&
    kcalPct <= 1.10 &&
    proteinPct >= 0.90 &&
    fatPct <= 1.05
  ) {
    nudges.push({
      id: 'macros-dialed',
      tone: 'good',
      text: `Macros looking dialed in.`,
    })
  }

  // Prioritize warns first, then info, then good; cap at 3
  const order: Nudge['tone'][] = ['warn', 'info', 'good']
  return nudges
    .sort((a, b) => order.indexOf(a.tone) - order.indexOf(b.tone))
    .slice(0, 3)
}
