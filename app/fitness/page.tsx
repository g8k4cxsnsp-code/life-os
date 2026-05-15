'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useStore, useLiftsByDay, useLiftProgress } from '@/lib/store'
import { epley1RM, getPR } from '@/lib/fitness'
import { toLocalDateString, formatShortDate } from '@/lib/date'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { NeonInput } from '@/components/ui/NeonInput'
import { PageHeader } from '@/components/ui/PageHeader'
import { Plus, Trophy, TrendingUp, Scale, Dumbbell, X, ChevronRight, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Lift, WorkoutDayCategory } from '@/types'
import { DEFAULT_SETTINGS } from '@/lib/store/defaults'

const TABS = ['Workout Split', 'Overview', 'Bodyweight', 'PRs'] as const
type Tab = typeof TABS[number]

const DAY_LABELS: Record<WorkoutDayCategory, string> = {
  'legs': 'Legs',
  'back-chest': 'Back & Chest',
  'shoulders-arms': 'Shoulders & Arms',
}
const DAY_COLORS: Record<WorkoutDayCategory, string> = {
  'legs': '#C6FF3D',
  'back-chest': '#FF2D87',
  'shoulders-arms': '#00E5FF',
}
const DAY_ORDER: WorkoutDayCategory[] = ['legs', 'back-chest', 'shoulders-arms']

// ── Progress Modal ─────────────────────────────────────────────────────────

function ProgressModal({ lift, onClose }: { lift: Lift; onClose: () => void }) {
  const { first, lastSession, today, chartData } = useLiftProgress(lift.id)
  const color = DAY_COLORS[lift.dayCategory]

  const todayBest = today.length > 0
    ? today.reduce((b, s) => epley1RM(s.weight ?? 0, s.reps) > b ? epley1RM(s.weight ?? 0, s.reps) : b, 0)
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        <GlassCard glow={color} className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-black text-lg">{lift.name}</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-3">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">First session</p>
              {first ? (
                <>
                  <p className="text-white font-bold text-sm">
                    {first.weight ? `${first.weight}kg × ${first.reps}` : `${first.reps} reps`}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: `${color}80` }}>
                    {formatShortDate(first.date)} · {Math.round(first.e1rm)}kg e1RM
                  </p>
                </>
              ) : (
                <p className="text-white/30 text-sm">No data yet</p>
              )}
            </GlassCard>
            <GlassCard className="p-3">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Last session</p>
              {lastSession ? (
                <>
                  <p className="text-white font-bold text-sm">
                    {lastSession.weight ? `${lastSession.weight}kg × ${lastSession.reps}` : `${lastSession.reps} reps`}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: `${color}80` }}>
                    {formatShortDate(lastSession.date)} · {Math.round(lastSession.e1rm)}kg e1RM
                  </p>
                </>
              ) : (
                <p className="text-white/30 text-sm">No previous session</p>
              )}
            </GlassCard>
          </div>

          {todayBest !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
              style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
              <TrendingUp className="w-4 h-4" />
              Today: {Math.round(todayBest)}kg e1RM
              {lastSession && (
                <span className="ml-auto text-xs opacity-80">
                  {todayBest >= lastSession.e1rm ? '+' : ''}{Math.round(todayBest - lastSession.e1rm)}kg
                </span>
              )}
            </div>
          )}

          {/* Chart */}
          {chartData.length > 1 && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">e1RM Progress</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }}
                    tickFormatter={(d) => formatShortDate(d)} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} width={32} />
                  <Tooltip contentStyle={{ background: '#0E0B16', border: `1px solid ${color}40`, borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    labelFormatter={(d) => formatShortDate(d as string)} />
                  <Line type="monotone" dataKey="e1rm" stroke={color} strokeWidth={2} dot={false}
                    style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.length === 0 && (
            <p className="text-center text-white/30 text-sm py-4">Log your first set to start tracking progress.</p>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

// ── Exercise Card ──────────────────────────────────────────────────────────

function ExerciseCard({ lift, dayColor }: { lift: Lift; dayColor: string }) {
  const { logSets } = useStore()
  const { lastSession, today, chartData } = useLiftProgress(lift.id)
  const [modalOpen, setModalOpen] = useState(false)
  const today_date = toLocalDateString(new Date())

  const defaultSets = (): Array<{ weight: string; reps: string }> => {
    const base = lastSession
      ? Array(3).fill({ weight: lastSession.weight?.toString() ?? '', reps: lastSession.reps.toString() })
      : Array(3).fill({ weight: '', reps: '' })
    // If already logged today, prefill from today's sets
    if (today.length > 0) {
      return Array(3).fill(null).map((_, i) => {
        const s = today[i]
        return s ? { weight: s.weight?.toString() ?? '', reps: s.reps.toString() } : base[i]
      })
    }
    return base
  }

  const [sets, setSets] = useState<Array<{ weight: string; reps: string }>>(defaultSets)
  const [saved, setSaved] = useState(today.length > 0)

  const alreadyLoggedToday = today.length > 0
  const todayBestE1RM = alreadyLoggedToday
    ? today.reduce((b, s) => Math.max(b, epley1RM(s.weight ?? 0, s.reps)), 0)
    : null
  const delta = todayBestE1RM !== null && lastSession
    ? Math.round(todayBestE1RM - lastSession.e1rm)
    : null

  function handleSave() {
    const parsed = sets
      .map((s) => ({
        weight: lift.unit === 'bw' ? undefined : parseFloat(s.weight),
        reps: parseInt(s.reps),
      }))
      .filter((s) => !isNaN(s.reps) && s.reps > 0)
    if (parsed.length === 0) return
    logSets(lift.id, today_date, parsed)
    setSaved(true)
  }

  function updateSet(i: number, field: 'weight' | 'reps', value: string) {
    setSets((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
    setSaved(false)
  }

  return (
    <>
      <GlassCard glow={saved ? dayColor : undefined} className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 text-left group"
            onClick={() => setModalOpen(true)}
          >
            <span className="font-bold text-white text-sm group-hover:underline">{lift.name}</span>
            <BarChart2 className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
          </button>
          <div className="flex items-center gap-2">
            {delta !== null && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: delta >= 0 ? `${dayColor}15` : 'rgba(255,45,45,0.1)',
                  color: delta >= 0 ? dayColor : '#ff4545',
                  border: `1px solid ${delta >= 0 ? dayColor : '#ff4545'}30`,
                }}>
                {delta >= 0 ? '+' : ''}{delta}kg e1RM
              </span>
            )}
            {!alreadyLoggedToday && lastSession && (
              <span className="text-xs text-white/25">
                Last: {lastSession.weight ? `${lastSession.weight}kg×${lastSession.reps}` : `${lastSession.reps}r`}
              </span>
            )}
            {!lastSession && (
              <span className="text-xs text-white/25">First session!</span>
            )}
          </div>
        </div>

        {/* 3 set inputs */}
        <div className="space-y-2">
          {sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-white/30 text-xs w-10">Set {i + 1}</span>
              {lift.unit !== 'bw' && (
                <NeonInput
                  value={s.weight}
                  onChange={(e) => updateSet(i, 'weight', e.target.value)}
                  placeholder="kg"
                  type="number"
                  accentColor={dayColor}
                  className="w-20"
                />
              )}
              <NeonInput
                value={s.reps}
                onChange={(e) => updateSet(i, 'reps', e.target.value)}
                placeholder="reps"
                type="number"
                accentColor={dayColor}
                className="w-20"
              />
            </div>
          ))}
        </div>

        <NeonButton
          color={saved ? dayColor : undefined}
          size="sm"
          className="w-full"
          onClick={handleSave}
        >
          {saved ? '✓ Saved' : 'Save Sets'}
        </NeonButton>
      </GlassCard>

      <AnimatePresence>
        {modalOpen && (
          <ProgressModal lift={lift} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

// ── Workout Split Tab ──────────────────────────────────────────────────────

function WorkoutSplitTab() {
  const { addLift } = useStore()
  const [selectedDay, setSelectedDay] = useState<WorkoutDayCategory>('legs')
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState<'kg' | 'reps' | 'bw'>('kg')

  const liftsForDay = useLiftsByDay(selectedDay)
  const color = DAY_COLORS[selectedDay]

  function handleAddExercise() {
    if (!newName.trim()) return
    addLift({
      id: `lift-${Date.now()}`,
      name: newName.trim(),
      unit: newUnit,
      category: newUnit === 'bw' ? 'bodyweight' : 'barbell',
      dayCategory: selectedDay,
      active: true,
      createdAt: new Date().toISOString(),
    })
    setNewName('')
    setAddOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Day pills */}
      <div className="flex gap-1.5">
        {DAY_ORDER.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border',
              selectedDay === day
                ? 'text-black'
                : 'text-white/40 border-white/[0.06] hover:text-white/70'
            )}
            style={selectedDay === day ? {
              background: DAY_COLORS[day],
              border: `1px solid ${DAY_COLORS[day]}`,
              boxShadow: `0 0 16px ${DAY_COLORS[day]}50`,
            } : {}}
          >
            {DAY_LABELS[day]}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {liftsForDay.map((lift) => (
          <ExerciseCard key={lift.id} lift={lift} dayColor={color} />
        ))}
        {liftsForDay.length === 0 && (
          <p className="text-center text-white/30 text-sm py-8">No exercises yet. Add one below.</p>
        )}
      </div>

      {/* Add exercise */}
      <AnimatePresence>
        {addOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <GlassCard glow={color} className="p-4 space-y-3">
              <NeonInput
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Exercise name"
                accentColor={color}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddExercise()}
              />
              <div className="flex gap-2">
                {(['kg', 'reps', 'bw'] as const).map((u) => (
                  <button key={u} onClick={() => setNewUnit(u)}
                    className={cn('flex-1 py-2 rounded-lg text-xs font-bold transition-all border',
                      newUnit === u ? 'text-black' : 'border-white/[0.06] text-white/40')}
                    style={newUnit === u ? { background: color, border: `1px solid ${color}` } : {}}>
                    {u === 'bw' ? 'Bodyweight' : u.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-white/30 text-xs">Adding to: <span style={{ color }}>{DAY_LABELS[selectedDay]}</span></p>
              <NeonButton color={color} size="sm" className="w-full" onClick={handleAddExercise}>
                Add Exercise
              </NeonButton>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setAddOpen(!addOpen)}
        className="w-full py-3 rounded-xl border border-dashed border-white/[0.08] text-white/30 text-sm hover:text-white/50 hover:border-white/20 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add exercise to {DAY_LABELS[selectedDay]}
      </button>
    </div>
  )
}

// ── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab({ lifts }: { lifts: Lift[] }) {
  const { liftSets: liftSetsRaw } = useStore()
  const safeLifts = Array.isArray(lifts) ? lifts : []
  const liftSets = Array.isArray(liftSetsRaw) ? liftSetsRaw : []
  return (
    <div className="grid grid-cols-2 gap-3">
      {safeLifts.slice(0, 6).map((lift) => {
        const sets = liftSets.filter((s) => s.liftId === lift.id)
        const pr = getPR(sets)
        const color = DAY_COLORS[lift.dayCategory] ?? '#FF2D87'
        return (
          <GlassCard key={lift.id} glow={color} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-3.5 h-3.5" style={{ color }} />
              <p className="text-white/60 text-xs font-semibold truncate">{lift.name}</p>
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

// ── Bodyweight Tab ─────────────────────────────────────────────────────────

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
              <Line type="monotone" dataKey="kg" stroke="#00E5FF" strokeWidth={2} dot={false}
                style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      <GlassCard className="p-4 flex gap-3">
        <NeonInput value={kgInput} onChange={(e) => setKgInput(e.target.value)}
          placeholder="e.g. 78.5" type="number" accentColor="#00E5FF" className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && logToday()} />
        <NeonButton color="#00E5FF" onClick={logToday}>
          <Scale className="w-4 h-4" /> Log
        </NeonButton>
      </GlassCard>
    </div>
  )
}

// ── PRs Tab ────────────────────────────────────────────────────────────────

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
        const color = DAY_COLORS[lift.dayCategory] ?? '#FF2D87'
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

// ── Main Page ──────────────────────────────────────────────────────────────

export default function FitnessPage() {
  const { lifts: liftsRaw } = useStore()
  const [tab, setTab] = useState<Tab>('Workout Split')

  const lifts = Array.isArray(liftsRaw) ? liftsRaw : []
  const activeLifts = lifts.filter((l) => l.active)

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <PageHeader
          title="Fitness"
          subtitle="Track your lifts, bodyweight & PRs"
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
            {tab === 'Workout Split' && <WorkoutSplitTab />}
            {tab === 'Overview' && <OverviewTab lifts={activeLifts} />}
            {tab === 'Bodyweight' && <BodyweightSection />}
            {tab === 'PRs' && <PRsSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
