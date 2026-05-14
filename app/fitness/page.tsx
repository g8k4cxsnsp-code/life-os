'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useStore } from '@/lib/store'
import { epley1RM, getPR } from '@/lib/fitness'
import { toLocalDateString, formatShortDate } from '@/lib/date'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { NeonInput } from '@/components/ui/NeonInput'
import { PageHeader } from '@/components/ui/PageHeader'
import { Plus, Trophy, TrendingUp, Scale, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Lift } from '@/types'
import { DEFAULT_SETTINGS } from '@/lib/store/defaults'

const TABS = ['Overview', 'Log Workout', 'Bodyweight', 'PRs'] as const
type Tab = typeof TABS[number]

function OverviewTab({ lifts }: { lifts: Lift[] }) {
  const { liftSets: liftSetsRaw } = useStore()
  const safeLifts = Array.isArray(lifts) ? lifts : []
  const liftSets = Array.isArray(liftSetsRaw) ? liftSetsRaw : []
  return (
    <div className="grid grid-cols-2 gap-3">
      {safeLifts.slice(0, 6).map((lift) => {
        const sets = liftSets.filter((s) => s.liftId === lift.id)
        const pr = getPR(sets)
        const color = lift.unit === 'bw' ? '#C6FF3D' : '#FF2D87'
        return (
          <GlassCard key={lift.id} glow={color} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-3.5 h-3.5" style={{ color }} />
              <p className="text-white/60 text-xs font-semibold">{lift.name}</p>
            </div>
            {pr ? (
              <>
                <p className="font-black text-lg text-white">
                  {pr.weight ? `${pr.weight}kg` : `${pr.reps}r`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: `${color}80` }}>
                  {pr.est1RM}kg e1RM
                </p>
              </>
            ) : (
              <p className="text-white/25 text-sm">No data yet</p>
            )}
          </GlassCard>
        )
      })}
    </div>
  )
}

function BodyweightSection() {
  const { bodyweight: bodyweightRaw, addBodyweight, settings } = useStore()
  const [kgInput, setKgInput] = useState('')

  const bodyweight = Array.isArray(bodyweightRaw) ? bodyweightRaw : []
  const startingWeight = typeof settings?.startingWeight === 'number'
    ? settings.startingWeight
    : DEFAULT_SETTINGS.startingWeight

  const sorted = [...bodyweight].sort((a, b) => a.date.localeCompare(b.date))
  const chartData = sorted.slice(-60).map((b) => ({
    date: formatShortDate(b.date),
    kg: b.kg,
  }))
  const latest = sorted[sorted.length - 1]
  const delta = latest ? latest.kg - startingWeight : 0

  function logToday() {
    const kg = parseFloat(kgInput)
    if (isNaN(kg) || kg < 20 || kg > 300) return
    addBodyweight({
      id: `bw-${Date.now()}`,
      date: toLocalDateString(new Date()),
      kg,
    })
    setKgInput('')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <GlassCard glow="#00E5FF" className="flex-1 p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider">Current</p>
          <p className="text-2xl font-black text-white mt-1">{latest?.kg ?? startingWeight}<span className="text-white/40 text-sm ml-1">kg</span></p>
        </GlassCard>
        <GlassCard glow={delta >= 0 ? '#C6FF3D' : '#FF2D87'} className="flex-1 p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider">vs Start</p>
          <p className="text-2xl font-black mt-1" style={{ color: delta >= 0 ? '#C6FF3D' : '#FF2D87' }}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}<span className="text-sm ml-1">kg</span>
          </p>
        </GlassCard>
      </div>

      {chartData.length > 1 && (
        <GlassCard className="p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Bodyweight History</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ background: '#0E0B16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="kg"
                stroke="#00E5FF"
                strokeWidth={2}
                dot={false}
                style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      <GlassCard className="p-4 flex gap-3">
        <NeonInput
          value={kgInput}
          onChange={(e) => setKgInput(e.target.value)}
          placeholder="e.g. 78.5"
          type="number"
          accentColor="#00E5FF"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && logToday()}
        />
        <NeonButton color="#00E5FF" onClick={logToday}>
          <Scale className="w-4 h-4" /> Log
        </NeonButton>
      </GlassCard>
    </div>
  )
}

function LiftSection({ lift }: { lift: Lift }) {
  const { liftSets: liftSetsRaw, addLiftSet, removeLiftSet } = useStore()
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rpe, setRpe] = useState('')

  const liftSets = Array.isArray(liftSetsRaw) ? liftSetsRaw : []
  const liftSetsForThis = liftSets.filter((s) => s.liftId === lift.id)
  const pr = getPR(liftSetsForThis)
  const color = lift.unit === 'bw' ? '#C6FF3D' : '#FF2D87'

  // Chart data: best e1RM per date
  const byDate: Record<string, number> = {}
  liftSetsForThis.forEach((s) => {
    const e1rm = epley1RM(s.weight ?? 0, s.reps)
    if (!byDate[s.date] || e1rm > byDate[s.date]) byDate[s.date] = e1rm
  })
  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-20)
    .map(([date, e1rm]) => ({ date: formatShortDate(date), e1rm: Math.round(e1rm) }))

  const recentSets = [...liftSetsForThis]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 8)

  function logSet() {
    const w = lift.unit === 'bw' ? 0 : parseFloat(weight)
    const r = parseInt(reps)
    if (isNaN(r) || r < 1) return
    if (lift.unit !== 'bw' && isNaN(w)) return

    const isNewPR = pr === null || epley1RM(w, r) > pr.est1RM
    addLiftSet({
      id: `set-${Date.now()}`,
      liftId: lift.id,
      date: toLocalDateString(new Date()),
      weight: lift.unit === 'bw' ? undefined : w,
      reps: r,
      rpe: rpe ? parseInt(rpe) : undefined,
    })
    setWeight('')
    setReps('')
    setRpe('')
  }

  return (
    <GlassCard glow={color} className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-white text-base">{lift.name}</h3>
          {pr && (
            <p className="text-xs mt-0.5" style={{ color }}>
              PR: {pr.weight ? `${pr.weight}kg × ${pr.reps}` : `${pr.reps} reps`} → {pr.est1RM}kg e1RM
            </p>
          )}
        </div>
        {pr && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
            <Trophy className="w-3 h-3" /> PR
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} />
            <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} width={32} />
            <Tooltip contentStyle={{ background: '#0E0B16', border: `1px solid ${color}40`, borderRadius: '8px', color: '#fff', fontSize: '11px' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)' }} />
            <Line type="monotone" dataKey="e1rm" stroke={color} strokeWidth={2} dot={false}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Log set */}
      <div className="flex gap-2">
        {lift.unit !== 'bw' && (
          <NeonInput value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" type="number" accentColor={color} className="w-20" />
        )}
        <NeonInput value={reps} onChange={(e) => setReps(e.target.value)} placeholder="reps" type="number" accentColor={color} className="w-20" />
        <NeonInput value={rpe} onChange={(e) => setRpe(e.target.value)} placeholder="RPE" type="number" accentColor={color} className="w-16" />
        <NeonButton color={color} size="sm" onClick={logSet}>Log</NeonButton>
      </div>

      {/* Recent sets */}
      {recentSets.length > 0 && (
        <div className="space-y-1">
          {recentSets.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-xs text-white/40 py-1 border-b border-white/[0.04] last:border-0">
              <span>{formatShortDate(s.date)}</span>
              <span>
                {s.weight ? `${s.weight}kg × ` : ''}{s.reps} reps
                {s.rpe ? ` @ RPE ${s.rpe}` : ''}
              </span>
              <button onClick={() => removeLiftSet(s.id)} className="text-white/20 hover:text-red-400 transition-colors ml-2">×</button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

function PRsSection() {
  const { lifts: liftsRaw, liftSets: liftSetsRaw } = useStore()
  const lifts = Array.isArray(liftsRaw) ? liftsRaw : []
  const liftSets = Array.isArray(liftSetsRaw) ? liftSetsRaw : []

  return (
    <div className="space-y-3">
      {lifts.filter((l) => l.active).map((lift) => {
        const sets = liftSets.filter((s) => s.liftId === lift.id)
        const pr = getPR(sets)
        if (!pr) return null
        const color = lift.unit === 'bw' ? '#C6FF3D' : '#FF2D87'
        return (
          <GlassCard key={lift.id} glow={color} className="p-4 flex items-center gap-4">
            <Trophy className="w-5 h-5 flex-shrink-0" style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{lift.name}</p>
              <p className="text-white/40 text-xs">{formatShortDate(pr.date)}</p>
            </div>
            <div className="text-right">
              <p className="font-black" style={{ color }}>
                {pr.weight ? `${pr.weight}kg × ${pr.reps}` : `${pr.reps} reps`}
              </p>
              <p className="text-white/30 text-xs">{pr.est1RM}kg e1RM</p>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

export default function FitnessPage() {
  const { lifts: liftsRaw, addLift } = useStore()
  const [tab, setTab] = useState<Tab>('Overview')
  const [addLiftOpen, setAddLiftOpen] = useState(false)
  const [newLiftName, setNewLiftName] = useState('')
  const [newLiftUnit, setNewLiftUnit] = useState<'kg' | 'reps' | 'bw'>('kg')

  const lifts = Array.isArray(liftsRaw) ? liftsRaw : []
  const activeLifts = lifts.filter((l) => l.active)

  function handleAddLift() {
    if (!newLiftName.trim()) return
    addLift({
      id: `lift-${Date.now()}`,
      name: newLiftName.trim(),
      unit: newLiftUnit,
      category: newLiftUnit === 'bw' ? 'bodyweight' : 'barbell',
      active: true,
      createdAt: new Date().toISOString(),
    })
    setNewLiftName('')
    setAddLiftOpen(false)
  }

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <PageHeader
          title="Fitness"
          subtitle="Track your lifts, bodyweight & PRs"
          right={
            tab === 'Log Workout' ? (
              <NeonButton size="sm" onClick={() => setAddLiftOpen(!addLiftOpen)}>
                <Plus className="w-3.5 h-3.5" /> Exercise
              </NeonButton>
            ) : undefined
          }
        />

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 text-xs font-semibold py-2 rounded-lg transition-all',
                tab === t ? 'bg-[#FF2D87] text-white' : 'text-white/40 hover:text-white/70'
              )}
              style={tab === t ? { boxShadow: '0 0 12px rgba(255,45,135,0.4)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Add lift form */}
        <AnimatePresence>
          {addLiftOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <GlassCard glow="#FF2D87" className="p-4 space-y-3">
                <NeonInput value={newLiftName} onChange={(e) => setNewLiftName(e.target.value)} placeholder="Exercise name" autoFocus />
                <div className="flex gap-2">
                  {(['kg', 'reps', 'bw'] as const).map((u) => (
                    <button key={u} onClick={() => setNewLiftUnit(u)}
                      className={cn('flex-1 py-2 rounded-lg text-xs font-bold transition-all border',
                        newLiftUnit === u ? 'bg-[#FF2D87]/20 border-[#FF2D87]/40 text-[#FF2D87]' : 'border-white/[0.06] text-white/40')}>
                      {u === 'bw' ? 'Bodyweight' : u.toUpperCase()}
                    </button>
                  ))}
                </div>
                <NeonButton size="sm" className="w-full" onClick={handleAddLift}>Add Exercise</NeonButton>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {tab === 'Overview' && (
              <OverviewTab lifts={activeLifts} />
            )}

            {tab === 'Log Workout' && (
              <div className="space-y-4">
                {activeLifts.map((lift) => (
                  <LiftSection key={lift.id} lift={lift} />
                ))}
              </div>
            )}

            {tab === 'Bodyweight' && <BodyweightSection />}

            {tab === 'PRs' && <PRsSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
