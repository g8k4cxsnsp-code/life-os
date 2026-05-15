'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { toLocalDateString } from '@/lib/date'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { NeonInput } from '@/components/ui/NeonInput'
import { PageHeader } from '@/components/ui/PageHeader'
import { useMounted } from '@/lib/useMounted'
import { Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

const COLOR = '#00E5FF'

export default function WeightPage() {
  const mounted = useMounted()
  const { bodyweight, addBodyweight, removeBodyweight, settings, updateSettings } = useStore()
  const today = toLocalDateString(new Date())

  const todayEntry = bodyweight.find((b) => b.date === today)
  const [kg, setKg] = useState<string>('')
  const [syncProfile, setSyncProfile] = useState(true)

  useEffect(() => {
    if (!mounted) return
    if (todayEntry) setKg(String(todayEntry.kg))
  }, [mounted, todayEntry])

  function save() {
    const val = parseFloat(kg)
    if (isNaN(val) || val <= 0) return
    addBodyweight({ id: `bw-${Date.now()}`, date: today, kg: val })
    if (syncProfile) {
      updateSettings({
        profile: {
          ...(settings.profile ?? { age: 25, sex: 'male', heightCm: 175, trainingDaysPerWeek: 3 }),
          weightKg: val,
        },
      })
    }
  }

  // Last 14 entries (most recent first for the list)
  const sorted = useMemo(
    () => [...bodyweight].sort((a, b) => b.date.localeCompare(a.date)),
    [bodyweight],
  )
  const recent = sorted.slice(0, 14)

  // Chart: 30 days ascending
  const chartData = useMemo(() => {
    const cutoff = toLocalDateString(new Date(Date.now() - 30 * 86400_000))
    return [...bodyweight]
      .filter((b) => b.date >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((b) => ({
        date: b.date.slice(5), // MM-DD
        kg: b.kg,
      }))
  }, [bodyweight])

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <PageHeader title="Weight" subtitle="Track your body weight over time" />

        {/* Log today */}
        <GlassCard glow={COLOR} className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)' }}
            >
              <span className="text-[#00E5FF] text-lg font-black">kg</span>
            </div>
            <div>
              <p className="text-white font-bold">Today's weight</p>
              <p className="text-white/40 text-xs">
                {mounted
                  ? new Date().toLocaleDateString('en-ZA', { weekday: 'long', month: 'short', day: 'numeric' })
                  : today}
              </p>
            </div>
          </div>

          <NeonInput
            label="Body weight (kg)"
            type="number"
            step="0.1"
            min="20"
            max="300"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="e.g. 78.5"
            accentColor={COLOR}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={syncProfile}
              onChange={(e) => setSyncProfile(e.target.checked)}
              className="w-4 h-4 accent-[#00E5FF]"
            />
            <span className="text-white/60 text-sm">Update profile weight (recalculates TDEE)</span>
          </label>

          <NeonButton color={COLOR} className="w-full" onClick={save}>
            Save
          </NeonButton>
        </GlassCard>

        {/* Trend chart */}
        {chartData.length >= 2 && (
          <GlassCard className="p-5 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">30-day trend</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{ background: '#13111C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                    itemStyle={{ color: COLOR }}
                    formatter={(v: number) => [`${v} kg`, 'Weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="kg"
                    stroke={COLOR}
                    strokeWidth={2}
                    dot={{ fill: COLOR, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: COLOR }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        {/* Recent entries */}
        {recent.length > 0 && (
          <GlassCard className="p-5 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">Recent entries</p>
            <div className="space-y-1">
              {recent.map((entry, idx) => {
                const prev = recent[idx + 1]
                const delta = prev ? entry.kg - prev.kg : null
                const dateLabel = mounted
                  ? new Date(entry.date).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })
                  : entry.date
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <div
                      className="w-1 h-8 rounded-full flex-shrink-0"
                      style={{ background: COLOR, boxShadow: `0 0 6px ${COLOR}66` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-medium">{dateLabel}</p>
                      <p className="text-white/40 text-xs">
                        {entry.kg} kg
                        {delta !== null && (
                          <span
                            className="ml-2"
                            style={{ color: delta < 0 ? '#C6FF3D' : delta > 0 ? '#FF2D87' : 'rgba(255,255,255,0.3)' }}
                          >
                            {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg
                          </span>
                        )}
                      </p>
                    </div>
                    {delta !== null && (
                      delta < -0.05 ? <TrendingDown className="w-4 h-4 text-[#C6FF3D]" />
                      : delta > 0.05 ? <TrendingUp className="w-4 h-4 text-[#FF2D87]" />
                      : <Minus className="w-4 h-4 text-white/20" />
                    )}
                    <button
                      onClick={() => removeBodyweight(entry.id)}
                      className="text-white/20 hover:text-[#FF2D87] transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        )}

        {recent.length === 0 && (
          <GlassCard className="p-8 text-center">
            <p className="text-white/30 text-sm">No entries yet. Log your first weight above.</p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
