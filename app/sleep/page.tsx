'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { toLocalDateString } from '@/lib/date'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { NeonInput } from '@/components/ui/NeonInput'
import { PageHeader } from '@/components/ui/PageHeader'
import { Moon, Star } from 'lucide-react'
import { useMounted } from '@/lib/useMounted'

function ratingColor(rating: number): string {
  if (rating >= 85) return '#C6FF3D'
  if (rating >= 65) return '#00E5FF'
  if (rating >= 40) return '#FFB020'
  return '#FF2D87'
}

function ratingLabel(rating: number): string {
  if (rating >= 90) return 'Amazing'
  if (rating >= 75) return 'Great'
  if (rating >= 60) return 'Good'
  if (rating >= 40) return 'Okay'
  if (rating >= 20) return 'Poor'
  return 'Terrible'
}

export default function SleepPage() {
  const mounted = useMounted()
  const { history, updateDayLog } = useStore()
  const today = toLocalDateString(new Date())
  const todayLog = history[today]

  const [hours, setHours] = useState<string>('')
  const [rating, setRating] = useState<number>(75)

  useEffect(() => {
    if (!mounted) return
    if (todayLog?.sleepH !== undefined) setHours(String(todayLog.sleepH))
    if (todayLog?.sleepRating !== undefined) setRating(todayLog.sleepRating)
  }, [mounted, todayLog?.sleepH, todayLog?.sleepRating])

  function save() {
    const h = parseFloat(hours)
    updateDayLog(today, {
      sleepH: isNaN(h) ? undefined : h,
      sleepRating: rating,
    })
  }

  // Last 7 nights overview
  const recent: { date: string; h: number | undefined; rating: number | undefined }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = toLocalDateString(d)
    const log = history[key]
    recent.push({ date: key, h: log?.sleepH, rating: log?.sleepRating })
  }

  const color = ratingColor(rating)

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <PageHeader title="Sleep" subtitle="Log last night's rest" />

        {/* Tonight's log */}
        <GlassCard glow="#7A5CFF" className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(122,92,255,0.15)', border: '1px solid rgba(122,92,255,0.3)' }}>
              <Moon className="w-5 h-5 text-[#7A5CFF]" />
            </div>
            <div>
              <p className="text-white font-bold">Last night</p>
              <p className="text-white/40 text-xs">Logged for {mounted ? new Date().toLocaleDateString('en-ZA', { weekday: 'long', month: 'short', day: 'numeric' }) : ''}</p>
            </div>
          </div>

          <NeonInput
            label="Hours slept"
            type="number"
            step="0.25"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. 7.5"
            accentColor="#7A5CFF"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white/40 text-xs uppercase tracking-wider">Rating</label>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-2xl" style={{ color, textShadow: `0 0 12px ${color}66` }}>{rating}</span>
                <span className="text-white/30 text-sm">/ 100 · {ratingLabel(rating)}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full sleep-slider"
              style={{
                accentColor: color,
              }}
            />
            <div className="grid grid-cols-5 gap-1.5">
              {[20, 40, 60, 80, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => setRating(v)}
                  className="text-[10px] py-1.5 rounded-md border transition-colors"
                  style={{
                    borderColor: rating === v ? `${ratingColor(v)}50` : 'rgba(255,255,255,0.06)',
                    color: rating === v ? ratingColor(v) : 'rgba(255,255,255,0.4)',
                    background: rating === v ? `${ratingColor(v)}14` : 'transparent',
                  }}
                >
                  {ratingLabel(v)}
                </button>
              ))}
            </div>
          </div>

          <NeonButton color="#7A5CFF" className="w-full" onClick={save}>
            Save
          </NeonButton>
        </GlassCard>

        {/* Last 7 nights */}
        <GlassCard className="p-5 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Last 7 nights</p>
          <div className="space-y-2">
            {recent.map((r) => {
              const c = r.rating !== undefined ? ratingColor(r.rating) : '#3F3D4D'
              const dateLabel = mounted
                ? new Date(r.date).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })
                : r.date
              return (
                <motion.div
                  key={r.date}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div className="w-1 h-8 rounded-full" style={{ background: c, boxShadow: r.rating !== undefined ? `0 0 6px ${c}` : 'none' }} />
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium">{dateLabel}</p>
                    <p className="text-white/40 text-xs">
                      {r.h !== undefined ? `${r.h}h` : '—'} · {r.rating !== undefined ? `${r.rating}/100` : 'no rating'}
                    </p>
                  </div>
                  {r.rating !== undefined && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" style={{ color: c }} />
                      <span className="text-xs font-bold" style={{ color: c }}>{r.rating}</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
