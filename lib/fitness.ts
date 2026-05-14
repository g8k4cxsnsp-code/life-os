import type { LiftSet } from '@/types'

export function epley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export function getTopSetByDate(sets: LiftSet[]): Record<string, { weight: number; reps: number; est1RM: number }> {
  const byDate: Record<string, LiftSet[]> = {}
  sets.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = []
    byDate[s.date].push(s)
  })

  const result: Record<string, { weight: number; reps: number; est1RM: number }> = {}
  Object.entries(byDate).forEach(([date, dateSets]) => {
    const best = dateSets.reduce(
      (top, s) => {
        const e1rm = epley1RM(s.weight ?? 0, s.reps)
        return e1rm > top.est1RM ? { weight: s.weight ?? 0, reps: s.reps, est1RM: e1rm } : top
      },
      { weight: 0, reps: 0, est1RM: 0 }
    )
    result[date] = best
  })

  return result
}

export function getPR(sets: LiftSet[]): { weight: number; reps: number; est1RM: number; date: string } | null {
  if (sets.length === 0) return null
  let pr = { weight: 0, reps: 0, est1RM: 0, date: '' }
  sets.forEach((s) => {
    const e1rm = epley1RM(s.weight ?? 0, s.reps)
    if (e1rm > pr.est1RM) {
      pr = { weight: s.weight ?? 0, reps: s.reps, est1RM: e1rm, date: s.date }
    }
  })
  return pr.est1RM > 0 ? pr : null
}

export function formatWeight(weight: number, unit: string): string {
  return unit === 'bw' ? `${weight} reps BW` : `${weight}kg`
}
