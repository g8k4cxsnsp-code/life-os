'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts'
import { useStore } from '@/lib/store'
import { toLocalDateString } from '@/lib/date'
import { GlassCard } from '@/components/ui/GlassCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { useMounted } from '@/lib/useMounted'
import { cn } from '@/lib/cn'

type Metric =
  | 'weight'
  | 'kcal'
  | 'protein'
  | 'water'
  | 'sleepH'
  | 'sleepRating'
  | 'steps'
  | 'goalsPct'

type Range = '7d' | '30d' | '3m' | '6m' | 'ytd' | '1y' | 'all'

const METRICS: { id: Metric; label: string; color: string; unit?: string }[] = [
  { id: 'weight', label: 'Weight', color: '#FF2D87', unit: 'kg' },
  { id: 'kcal', label: 'Calories', color: '#C026FF', unit: 'kcal' },
  { id: 'protein', label: 'Protein', color: '#FF6B35', unit: 'g' },
  { id: 'water', label: 'Water', color: '#00E5FF', unit: 'L' },
  { id: 'sleepH', label: 'Sleep Hours', color: '#7A5CFF', unit: 'h' },
  { id: 'sleepRating', label: 'Sleep Rating', color: '#7A5CFF', unit: '/100' },
  { id: 'steps', label: 'Steps', color: '#C6FF3D' },
  { id: 'goalsPct', label: 'Goal Completion', color: '#FFB020', unit: '%' },
]

const RANGES: { id: Range; label: string; days: number | 'ytd' | 'all' }[] = [
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
  { id: '3m', label: '3m', days: 90 },
  { id: '6m', label: '6m', days: 180 },
  { id: 'ytd', label: 'YTD', days: 'ytd' },
  { id: '1y', label: '1y', days: 365 },
  { id: 'all', label: 'All', days: 'all' },
]

function startOfYear(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), 0, 1)
}

export default function ProgressPage() {
  const mounted = useMounted()
  const { history, bodyweight, meals, goals } = useStore()

  const [metric, setMetric] = useState<Metric>('weight')
  const [range, setRange] = useState<Range>('30d')

  const meta = METRICS.find((m) => m.id === metric)!

  const data = useMemo(() => {
    if (!mounted) return [] as { date: string; value: number | null; label: string }[]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const rangeDef = RANGES.find((r) => r.id === range)!

    let start: Date
    if (rangeDef.days === 'ytd') {
      start = startOfYear()
    } else if (rangeDef.days === 'all') {
      // Find earliest data point across all sources, fallback 365d.
      const candidates: string[] = [
        ...bodyweight.map((b) => b.date),
        ...Object.keys(history),
        ...meals.map((m) => m.date),
      ]
      if (candidates.length === 0) {
        start = new Date(today); start.setDate(start.getDate() - 30)
      } else {
        const min = candidates.sort()[0]
        start = new Date(min)
      }
    } else {
      start = new Date(today)
      start.setDate(start.getDate() - (rangeDef.days as number) + 1)
    }

    // Build a daily bucket from start..today
    const days: string[] = []
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      days.push(toLocalDateString(d))
    }

    // Index helper data
    const mealsByDate = new Map<string, { kcal: number; protein: number }>()
    for (const m of meals) {
      const cur = mealsByDate.get(m.date) ?? { kcal: 0, protein: 0 }
      cur.kcal += m.kcal
      cur.protein += m.protein
      mealsByDate.set(m.date, cur)
    }
    const bwByDate = new Map<string, number>()
    for (const b of bodyweight) bwByDate.set(b.date, b.kg)

    // Daily goal targets (used for goalsPct denominator).
    const activeDaily = goals.filter((g) => g.active && g.cadence === 'daily')

    return days.map((date) => {
      const log = history[date]
      let value: number | null = null
      switch (metric) {
        case 'weight':
          value = bwByDate.get(date) ?? null
          break
        case 'kcal':
          value = mealsByDate.get(date)?.kcal ?? null
          break
        case 'protein':
          value = mealsByDate.get(date)?.protein ?? null
          break
        case 'water':
          value = log?.waterL ?? null
          break
        case 'sleepH':
          value = log?.sleepH ?? null
          break
        case 'sleepRating':
          value = log?.sleepRating ?? null
          break
        case 'steps':
          value = log?.steps ?? null
          break
        case 'goalsPct': {
          if (!log) { value = null; break }
          const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
          const applicable = activeDaily.filter((g) => !g.schedule || g.schedule.length === 0 || g.schedule.includes(weekday as never))
          if (applicable.length === 0) { value = null; break }
          const done = applicable.filter((g) => !!log.completed[g.id]).length
          value = Math.round((done / applicable.length) * 100)
          break
        }
      }
      const labelDate = new Date(date)
      const label = labelDate.toLocaleDateString('en-ZA', {
        month: 'short', day: 'numeric',
        ...(days.length > 60 ? {} : {}),
      })
      return { date, value, label }
    })
  }, [mounted, metric, range, history, bodyweight, meals, goals])

  // For weight + sleep rating: connect across nulls. For totals like kcal/water:
  // treat nulls as zero (an empty day = 0 logged).
  const plotData = useMemo(() => {
    const fill = ['kcal', 'protein', 'water', 'steps'].includes(metric)
    return data.map((d) => ({ ...d, value: d.value ?? (fill ? 0 : null) }))
  }, [data, metric])

  const values = plotData.map((d) => d.value).filter((v): v is number => v !== null)
  const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : null
  const latest = [...plotData].reverse().find((d) => d.value !== null)?.value ?? null
  const first = plotData.find((d) => d.value !== null)?.value ?? null
  const delta = latest !== null && first !== null ? latest - first : null

  function fmt(v: number | null, unit?: string): string {
    if (v === null) return '—'
    const rounded = Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10
    return `${rounded}${unit ? ` ${unit}` : ''}`
  }

  return (
    <div className="px-4 py-8 lg:px-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <PageHeader title="Progress" subtitle="Track everything over time" />

        {/* Metric picker */}
        <GlassCard className="p-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {METRICS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={cn(
                  'whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  metric === m.id
                    ? 'text-white'
                    : 'text-white/40 border-white/[0.06] hover:text-white/70'
                )}
                style={metric === m.id ? {
                  borderColor: `${m.color}50`,
                  background: `${m.color}14`,
                  color: m.color,
                  boxShadow: `0 0 8px ${m.color}40`,
                } : undefined}
              >
                {m.label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Range picker */}
        <div className="flex gap-1.5 flex-wrap">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-semibold border transition-all',
                range === r.id
                  ? 'border-white/30 text-white bg-white/[0.06]'
                  : 'border-white/[0.06] text-white/40 hover:text-white/70'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard glow={meta.color} className="p-4">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Latest</p>
            <p className="font-black text-xl text-white mt-1">{fmt(latest, meta.unit)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Average</p>
            <p className="font-black text-xl text-white mt-1">{fmt(avg, meta.unit)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Change</p>
            <p className={cn('font-black text-xl mt-1')} style={{
              color: delta === null ? '#fff' : delta > 0
                ? (metric === 'weight' ? '#FFB020' : '#C6FF3D')
                : (metric === 'weight' ? '#C6FF3D' : '#FFB020'),
            }}>
              {delta === null ? '—' : `${delta > 0 ? '+' : ''}${fmt(delta, meta.unit)}`}
            </p>
          </GlassCard>
        </div>

        {/* Chart */}
        <GlassCard glow={meta.color} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/60 text-sm font-semibold">{meta.label}</p>
            <p className="text-white/30 text-xs">{plotData.length} day{plotData.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="h-72">
            {values.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm">
                <p>No data in this range yet.</p>
                <p className="text-xs mt-1">Log some {meta.label.toLowerCase()} to see the trend.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={plotData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={meta.color} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,12,22,0.95)',
                      border: `1px solid ${meta.color}40`,
                      borderRadius: 12,
                      color: 'white',
                      fontSize: 12,
                    }}
                    formatter={(v: number | string) => [fmt(typeof v === 'number' ? v : null, meta.unit), meta.label]}
                  />
                  {avg !== null && (
                    <ReferenceLine y={avg} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                  )}
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={meta.color}
                    strokeWidth={2}
                    fill="url(#metricFill)"
                    connectNulls
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-white/30 text-xs pt-4">
          Logged in {plotData.length} day window
        </motion.div>
      </div>
    </div>
  )
}
