'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/cn'

const TABS = ['Countdown', 'Stopwatch', 'Rest', 'Focus'] as const
type Tab = typeof TABS[number]

const PRESETS_FOCUS = [
  { label: 'Focus 25', seconds: 25 * 60, color: '#FF2D87' },
  { label: 'Deep Work 50', seconds: 50 * 60, color: '#C026FF' },
  { label: 'Flow 90', seconds: 90 * 60, color: '#7A5CFF' },
]

const PRESETS_REST = [
  { label: '60s', seconds: 60, color: '#00E5FF' },
  { label: '90s', seconds: 90, color: '#00E5FF' },
  { label: '2 min', seconds: 120, color: '#C6FF3D' },
  { label: '3 min', seconds: 180, color: '#FFB020' },
  { label: '5 min', seconds: 300, color: '#FF2D87' },
]

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatStopwatch(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const centisec = Math.floor((ms % 1000) / 10)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(centisec).padStart(2, '0')}`
}

// ── Countdown ──────────────────────────────────────────────────────────────
function CountdownTimer({ initialSeconds, color }: { initialSeconds?: number; color?: string }) {
  const accent = color ?? '#FF2D87'
  const [total, setTotal] = useState(initialSeconds ?? 25 * 60)
  const [remaining, setRemaining] = useState(initialSeconds ?? 25 * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (initialSeconds) {
      setTotal(initialSeconds)
      setRemaining(initialSeconds)
      setRunning(false)
    }
  }, [initialSeconds])

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
            return 0
          }
          return r - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  function reset() {
    setRunning(false)
    setRemaining(total)
  }

  const pct = total === 0 ? 0 : (remaining / total) * 100
  const size = 220, stroke = 14, r = (size - stroke) / 2
  const circ = 2 * Math.PI * r

  function adjustMinutes(delta: number) {
    const newTotal = Math.max(60, total + delta * 60)
    setTotal(newTotal)
    if (!running) setRemaining(newTotal)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full blur-3xl opacity-15" style={{ background: accent }} />
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={accent} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ pathLength: pct / 100 }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 10px ${accent})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="chrome-text font-black text-5xl" style={{ textShadow: `0 0 30px ${accent}60` }}>
            {formatTime(remaining)}
          </span>
          <span className="text-white/30 text-xs">{running ? 'Focus' : remaining === total ? 'Ready' : 'Paused'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => adjustMinutes(-5)} className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all">
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-white/30 text-sm px-2">{Math.round(total / 60)}m</span>
        <button onClick={() => adjustMinutes(5)} className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <NeonButton color={accent} size="lg" onClick={() => setRunning(!running)}>
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {running ? 'Pause' : 'Start'}
        </NeonButton>
        <NeonButton color={accent} variant="outline" size="lg" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
        </NeonButton>
      </div>
    </div>
  )
}

// ── Stopwatch ──────────────────────────────────────────────────────────────
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  function tick() {
    if (startRef.current !== null) {
      setElapsed(Date.now() - startRef.current)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [running])

  function reset() {
    setRunning(false)
    setElapsed(0)
    startRef.current = null
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-56 h-56 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full opacity-10 blur-2xl" style={{ background: '#C6FF3D' }} />
        <div className="w-48 h-48 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: 'rgba(198,255,61,0.2)', boxShadow: '0 0 40px rgba(198,255,61,0.1)' }}>
          <div className="text-center">
            <span className="chrome-text font-black text-4xl block" style={{ textShadow: '0 0 20px rgba(198,255,61,0.4)' }}>
              {formatStopwatch(elapsed)}
            </span>
            <span className="text-white/30 text-xs">{running ? 'Running' : elapsed > 0 ? 'Paused' : 'Ready'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <NeonButton color="#C6FF3D" size="lg" onClick={() => setRunning(!running)}>
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {running ? 'Stop' : 'Start'}
        </NeonButton>
        <NeonButton color="#C6FF3D" variant="outline" size="lg" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
        </NeonButton>
      </div>
    </div>
  )
}

// ── Rest Timer ──────────────────────────────────────────────────────────────
function RestTimer() {
  const [selected, setSelected] = useState(PRESETS_REST[1])
  const [key, setKey] = useState(0)

  function selectPreset(p: typeof PRESETS_REST[0]) {
    setSelected(p)
    setKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Preset pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PRESETS_REST.map((p) => (
          <button
            key={p.label}
            onClick={() => selectPreset(p)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-bold transition-all border',
              selected.label === p.label
                ? 'text-white border-transparent'
                : 'text-white/40 border-white/[0.08] hover:text-white/70'
            )}
            style={selected.label === p.label ? {
              background: `${p.color}30`,
              borderColor: `${p.color}50`,
              color: p.color,
              boxShadow: `0 0 12px ${p.color}30`,
            } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>
      <CountdownTimer key={key} initialSeconds={selected.seconds} color={selected.color} />
    </div>
  )
}

// ── Focus presets ──────────────────────────────────────────────────────────
function FocusPresets() {
  const [selected, setSelected] = useState(PRESETS_FOCUS[0])
  const [key, setKey] = useState(0)

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
        {PRESETS_FOCUS.map((p) => (
          <button
            key={p.label}
            onClick={() => { setSelected(p); setKey((k) => k + 1) }}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border',
              selected.label === p.label ? 'text-white' : 'text-white/40 border-white/[0.08] hover:text-white/70'
            )}
            style={selected.label === p.label ? {
              background: `${p.color}20`,
              borderColor: `${p.color}40`,
              color: p.color,
              boxShadow: `0 0 16px ${p.color}20`,
            } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>
      <CountdownTimer key={key} initialSeconds={selected.seconds} color={selected.color} />
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TimerPage() {
  const [tab, setTab] = useState<Tab>('Countdown')

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <PageHeader title="Timer" subtitle="Focus, rest, and gym timers" />

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'flex-1 text-xs font-semibold py-2 rounded-lg transition-all',
                tab === t ? 'bg-[#FF2D87] text-white' : 'text-white/40 hover:text-white/70'
              )}
              style={tab === t ? { boxShadow: '0 0 12px rgba(255,45,135,0.4)' } : {}}>
              {t}
            </button>
          ))}
        </div>

        <GlassCard className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'Countdown' && <CountdownTimer />}
              {tab === 'Stopwatch' && <Stopwatch />}
              {tab === 'Rest' && <RestTimer />}
              {tab === 'Focus' && <FocusPresets />}
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  )
}
