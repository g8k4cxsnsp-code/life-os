import type { DayLog, Goal, MealEntry } from '@/types'

export interface Suggestion {
  id: string
  message: string
  priority: number
}

interface RuleContext {
  log: DayLog
  todayGoals: Goal[]
  completedGoalIds: Set<string>
  meals: MealEntry[]
  now: Date
  waterTarget: number
}

export function getSuggestions(ctx: RuleContext): Suggestion[] {
  const results: Suggestion[] = []
  const hour = ctx.now.getHours()
  const { log, todayGoals, completedGoalIds, meals, waterTarget } = ctx

  // Water: after 10am, if behind expected pace
  if (hour >= 10) {
    const waterL = log.waterL ?? 0
    const dayProgress = Math.max(0, Math.min(1, (hour - 8) / 12)) // 0 at 8am → 1 at 8pm
    const expected = dayProgress * waterTarget
    if (waterL < expected - 0.25) {
      results.push({
        id: 'water',
        message: `💧 Time for a glass of water — you're at ${waterL.toFixed(2)}L of ${waterTarget}L`,
        priority: 1,
      })
    }
  }

  // Walk: after 11am, if fewer than 3000 steps
  if (hour >= 11 && (log.steps ?? 0) < 3000) {
    results.push({
      id: 'walk',
      message: '🚶 Take a 5-minute walk — fresh air resets the day',
      priority: 2,
    })
  }

  // Protein/meals: no meals by noon, or fewer than 2 meals by 6pm
  const mealCount = meals.length
  if ((hour >= 12 && mealCount === 0) || (hour >= 18 && mealCount < 2)) {
    results.push({
      id: 'protein',
      message: '🥜 Grab some nuts or a chicken sandwich — fuel up',
      priority: 3,
    })
  }

  // Pending goals: after 4pm if any uncompleted goals remain
  if (hour >= 16) {
    const pending = todayGoals.filter((g) => !completedGoalIds.has(g.id))
    if (pending.length > 0) {
      results.push({
        id: 'pending-goal',
        message: `⭐ Knock out: ${pending[0].title}`,
        priority: 4,
      })
    }
  }

  return results.sort((a, b) => a.priority - b.priority)
}
