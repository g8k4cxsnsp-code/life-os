import type { Weekday, WorkoutType } from '@/types'

export const WEEKDAY_NAMES: Weekday[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]

export function getTodayWeekday(): Weekday {
  const day = new Date().getDay() // 0=Sun, 1=Mon, ...
  const map: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return map[day]
}

export function getWeekdayFromDate(date: Date): Weekday {
  const map: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return map[date.getDay()]
}

export function isRestDay(weekday: Weekday, schedule: Record<Weekday, WorkoutType>): boolean {
  return schedule[weekday] === 'rest'
}

export function getWorkoutLabel(type: WorkoutType): string {
  const labels: Record<WorkoutType, string> = {
    calisthenics: 'Calisthenics',
    weights: 'Weight Training',
    'optional-cardio': 'Cardio / Conditioning',
    rest: 'Rest',
  }
  return labels[type]
}

export function getWorkoutColor(type: WorkoutType): string {
  const colors: Record<WorkoutType, string> = {
    calisthenics: '#C6FF3D',
    weights: '#FF2D87',
    'optional-cardio': '#00E5FF',
    rest: '#7A5CFF',
  }
  return colors[type]
}

export function getWorkoutEmoji(type: WorkoutType): string {
  const emojis: Record<WorkoutType, string> = {
    calisthenics: '🤸',
    weights: '🏋️',
    'optional-cardio': '🏃',
    rest: '😴',
  }
  return emojis[type]
}

export function getTimeGreeting(name: string): string {
  const hour = new Date().getHours()
  if (hour >= 4 && hour < 12) return `Good morning, ${name}.`
  if (hour >= 12 && hour < 18) return `Good afternoon, ${name}.`
  if (hour >= 18 && hour < 22) return `Good evening, ${name}.`
  return `Late night, ${name}.`
}
