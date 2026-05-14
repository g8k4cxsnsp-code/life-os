import { startOfWeek, format, parseISO } from 'date-fns'

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getWeekStart(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  return toLocalDateString(monday)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

export function getTodayString(): string {
  return toLocalDateString(new Date())
}

export function getWeekStartString(): string {
  return getWeekStart(new Date())
}
