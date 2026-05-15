'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { NeonInput } from '@/components/ui/NeonInput'
import { PageHeader } from '@/components/ui/PageHeader'
import { Trash2, Plus, Edit2, Check, X, Download, Upload, AlertTriangle, Zap } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Goal, Weekday, UserProfile, Sex } from '@/types'
import { DEFAULT_SETTINGS } from '@/lib/store/defaults'
import { WEEKDAY_NAMES } from '@/lib/schedule'
import type { WorkoutType } from '@/types'
import { classifyGoalSentence } from '@/lib/nutrition/targets-engine'

const TABS = ['Goals', 'Profile', 'Targets', 'Schedule', 'Foods', 'Data'] as const
type Tab = typeof TABS[number]

const NEON_COLORS = ['#FF2D87', '#00E5FF', '#C6FF3D', '#C026FF', '#7A5CFF', '#FFB020', '#FF6B35']

// ── Goal Editor ────────────────────────────────────────────────────────────
function GoalsTab() {
  const { goals, addGoal, updateGoal, removeGoal } = useStore()
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editColor, setEditColor] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newColor, setNewColor] = useState('#FF2D87')
  const [newCategory, setNewCategory] = useState<Goal['category']>('discipline')

  function startEdit(goal: Goal) {
    setEditId(goal.id)
    setEditTitle(goal.title)
    setEditColor(goal.color)
  }

  function saveEdit(goal: Goal) {
    updateGoal(goal.id, { title: editTitle, color: editColor })
    setEditId(null)
  }

  function handleAdd() {
    if (!newTitle.trim()) return
    addGoal({
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      color: newColor,
      cadence: 'daily',
      active: true,
      createdAt: new Date().toISOString(),
      order: goals.length,
    })
    setNewTitle('')
    setAddOpen(false)
  }

  return (
    <div className="space-y-4">
      <NeonButton size="sm" onClick={() => setAddOpen(!addOpen)}>
        <Plus className="w-3.5 h-3.5" /> Add Goal
      </NeonButton>

      <AnimatePresence>
        {addOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <GlassCard glow="#FF2D87" className="p-4 space-y-3">
              <NeonInput value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Goal title" autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Color</p>
                <div className="flex gap-2">
                  {NEON_COLORS.map((c) => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: c,
                        boxShadow: newColor === c ? `0 0 12px ${c}` : undefined,
                        transform: newColor === c ? 'scale(1.2)' : 'scale(1)',
                        outline: newColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <NeonButton size="sm" onClick={handleAdd}>Add</NeonButton>
                <NeonButton size="sm" variant="ghost" color="#FF2D87" onClick={() => setAddOpen(false)}>Cancel</NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {goals.map((goal) => (
          <GlassCard key={goal.id} glow={goal.color} className="p-3">
            {editId === goal.id ? (
              <div className="space-y-3">
                <NeonInput value={editTitle} onChange={(e) => setEditTitle(e.target.value)} accentColor={editColor}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(goal)} autoFocus />
                <div className="flex gap-2 flex-wrap">
                  {NEON_COLORS.map((c) => (
                    <button key={c} onClick={() => setEditColor(c)}
                      className="w-6 h-6 rounded-full transition-all"
                      style={{
                        background: c,
                        outline: editColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: '2px',
                        transform: editColor === c ? 'scale(1.15)' : 'scale(1)',
                      }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(goal)} className="text-[#C6FF3D] hover:text-white transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditId(null)} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: goal.color, boxShadow: `0 0 6px ${goal.color}` }} />
                <span className="text-white/80 text-sm flex-1">{goal.title}</span>
                <button
                  onClick={() => updateGoal(goal.id, { active: !goal.active })}
                  className={cn('text-xs px-2 py-0.5 rounded-full border transition-all',
                    goal.active ? 'text-[#C6FF3D] border-[#C6FF3D]/30' : 'text-white/30 border-white/10'
                  )}>
                  {goal.active ? 'Active' : 'Off'}
                </button>
                <button onClick={() => startEdit(goal)} className="text-white/30 hover:text-white transition-colors p-1">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => removeGoal(goal.id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

// ── Profile tab ────────────────────────────────────────────────────────────
const ACTIVITY_LABEL = (d: number) => {
  if (d <= 0) return 'Sedentary'
  if (d <= 2) return 'Light'
  if (d <= 4) return 'Moderate'
  if (d <= 6) return 'Very Active'
  return 'Extreme'
}

const BIAS_COLOR: Record<string, string> = {
  cut: '#FF2D87',
  bulk: '#C6FF3D',
  recomp: '#00E5FF',
  maintain: '#7A5CFF',
}

function ProfileTab() {
  const { settings, updateSettings, setProfile, setGoalSentence, setAutoTargets } = useStore()
  const s = settings
  const p = s.profile ?? { age: 25, sex: 'male' as Sex, weightKg: 75, heightCm: s.height || 175, trainingDaysPerWeek: 4 }
  const bias = classifyGoalSentence(s.goalSentence ?? '')

  function updateProfile(patch: Partial<UserProfile>) {
    const next = { ...p, ...patch }
    setProfile(next)
    updateSettings({ height: next.heightCm, startingWeight: next.weightKg })
  }

  return (
    <div className="space-y-4">
      {/* Identity */}
      <GlassCard className="p-4 space-y-4">
        <p className="text-white/40 text-xs uppercase tracking-wider">Identity</p>
        <NeonInput label="Name" value={s.name} onChange={(e) => updateSettings({ name: e.target.value })} />
        <NeonInput label="Wake time" type="time" value={s.wakeTime} onChange={(e) => updateSettings({ wakeTime: e.target.value })} />
      </GlassCard>

      {/* Body stats */}
      <GlassCard className="p-4 space-y-4">
        <p className="text-white/40 text-xs uppercase tracking-wider">Body Stats</p>

        <div className="grid grid-cols-2 gap-3">
          <NeonInput
            label="Age"
            type="number"
            value={String(p.age)}
            onChange={(e) => updateProfile({ age: parseInt(e.target.value) || p.age })}
            accentColor="#00E5FF"
          />
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Sex</p>
            <div className="flex gap-2">
              {(['male', 'female'] as Sex[]).map((sex) => (
                <button
                  key={sex}
                  onClick={() => updateProfile({ sex })}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-bold border transition-all capitalize',
                    p.sex === sex
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF]/40 text-[#00E5FF]'
                      : 'border-white/[0.06] text-white/40'
                  )}
                >
                  {sex}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NeonInput
            label="Weight (kg)"
            type="number"
            value={String(p.weightKg)}
            onChange={(e) => updateProfile({ weightKg: parseFloat(e.target.value) || p.weightKg })}
            accentColor="#C6FF3D"
          />
          <NeonInput
            label="Height (cm)"
            type="number"
            value={String(p.heightCm)}
            onChange={(e) => updateProfile({ heightCm: parseFloat(e.target.value) || p.heightCm })}
            accentColor="#C6FF3D"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Training days per week</p>
            <span className="text-xs font-bold" style={{ color: '#FFB020' }}>
              {p.trainingDaysPerWeek}d — {ACTIVITY_LABEL(p.trainingDaysPerWeek)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={7}
            value={p.trainingDaysPerWeek}
            onChange={(e) => updateProfile({ trainingDaysPerWeek: parseInt(e.target.value) })}
            className="w-full accent-[#FFB020]"
          />
          <div className="flex justify-between text-white/20 text-[10px] mt-1">
            <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
          </div>
        </div>
      </GlassCard>

      {/* Goal */}
      <GlassCard className="p-4 space-y-3">
        <p className="text-white/40 text-xs uppercase tracking-wider">Your Goal</p>
        <NeonInput
          label="What are you working toward?"
          value={s.goalSentence ?? ''}
          onChange={(e) => setGoalSentence(e.target.value)}
          placeholder='e.g. "lean down to 80kg while keeping strength"'
          accentColor="#C026FF"
        />
        {(s.goalSentence ?? '').length > 2 && (
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">Detected goal:</span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
              style={{ background: `${BIAS_COLOR[bias]}20`, color: BIAS_COLOR[bias], border: `1px solid ${BIAS_COLOR[bias]}40` }}
            >
              {bias}
            </span>
          </div>
        )}
      </GlassCard>

      {/* Auto-targets toggle */}
      <GlassCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#C6FF3D]" />
              <p className="text-white font-semibold text-sm">Auto-calculate targets</p>
            </div>
            <p className="text-white/40 text-xs">
              {s.autoTargets
                ? 'Targets are being computed from your profile and goal. Go to the Targets tab to view them.'
                : 'Turn on to auto-set your daily kcal, macros, water, and steps based on your stats above.'}
            </p>
          </div>
          <button
            onClick={() => setAutoTargets(!(s.autoTargets ?? false))}
            className={cn(
              'relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200',
              s.autoTargets ? 'bg-[#C6FF3D]' : 'bg-white/[0.1]'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-black transition-transform duration-200',
                s.autoTargets ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </GlassCard>
    </div>
  )
}

// ── Targets tab ────────────────────────────────────────────────────────────
function TargetsTab() {
  const { settings, updateSettings, setAutoTargets } = useStore()
  const t = settings?.targets ?? DEFAULT_SETTINGS.targets
  const auto = settings?.autoTargets ?? false

  function update(patch: Partial<typeof t>) {
    if (auto) return
    updateSettings({ targets: { ...t, ...patch } })
  }

  return (
    <div className="space-y-4">
      {auto && (
        <div className="rounded-xl px-3 py-2.5 text-xs text-white/60 flex items-start gap-2"
          style={{ background: 'rgba(198,255,61,0.06)', border: '1px solid rgba(198,255,61,0.2)' }}>
          <Zap className="w-3.5 h-3.5 text-[#C6FF3D] mt-0.5 flex-shrink-0" />
          <span>
            Auto-calculated from your profile.{' '}
            <button onClick={() => setAutoTargets(false)} className="underline text-[#C6FF3D] hover:text-[#C6FF3D]/80">
              Turn off auto-targets
            </button>{' '}
            to edit manually.
          </span>
        </div>
      )}
      <GlassCard className={cn('p-4 space-y-4', auto && 'opacity-70')}>
        <div className="grid grid-cols-2 gap-3">
          <NeonInput label="Daily Calories" type="number" value={String(t.kcal)} onChange={(e) => update({ kcal: parseInt(e.target.value) || t.kcal })} accentColor="#C026FF" disabled={auto} />
          <NeonInput label="Protein (g)" type="number" value={String(t.protein)} onChange={(e) => update({ protein: parseInt(e.target.value) || t.protein })} accentColor="#FF2D87" disabled={auto} />
          <NeonInput label="Carbs (g)" type="number" value={String(t.carbs)} onChange={(e) => update({ carbs: parseInt(e.target.value) || t.carbs })} accentColor="#C6FF3D" disabled={auto} />
          <NeonInput label="Fat (g)" type="number" value={String(t.fat)} onChange={(e) => update({ fat: parseInt(e.target.value) || t.fat })} accentColor="#FFB020" disabled={auto} />
          <NeonInput label="Water (L)" type="number" step="0.1" value={String(t.waterL)} onChange={(e) => update({ waterL: parseFloat(e.target.value) || t.waterL })} accentColor="#00E5FF" disabled={auto} />
          <NeonInput label="Steps" type="number" value={String(t.steps)} onChange={(e) => update({ steps: parseInt(e.target.value) || t.steps })} accentColor="#C6FF3D" disabled={auto} />
        </div>
      </GlassCard>
      {/* Sleep is always editable */}
      <GlassCard className="p-4">
        <NeonInput label="Sleep (hrs)" type="number" value={String(t.sleepH)} onChange={(e) => updateSettings({ targets: { ...t, sleepH: parseInt(e.target.value) || t.sleepH } })} accentColor="#7A5CFF" />
      </GlassCard>
    </div>
  )
}

// ── Schedule tab ───────────────────────────────────────────────────────────
function ScheduleTab() {
  const { settings, updateSettings } = useStore()
  const WORKOUT_TYPES: WorkoutType[] = ['calisthenics', 'weights', 'optional-cardio', 'rest']
  const COLORS: Record<WorkoutType, string> = {
    calisthenics: '#C6FF3D',
    weights: '#FF2D87',
    'optional-cardio': '#00E5FF',
    rest: '#7A5CFF',
  }

  const schedule = settings?.schedule ?? DEFAULT_SETTINGS.schedule

  function setDay(day: Weekday, type: WorkoutType) {
    updateSettings({ schedule: { ...schedule, [day]: type } })
  }

  return (
    <div className="space-y-2">
      {WEEKDAY_NAMES.map((day) => {
        const current = schedule[day]
        return (
          <GlassCard key={day} className="p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white/60 text-sm capitalize w-24">{day}</span>
              <div className="flex gap-1.5 flex-wrap">
                {WORKOUT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setDay(day, type)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-lg border transition-all capitalize',
                      current === type ? 'text-white font-semibold' : 'text-white/30 border-white/[0.06] hover:text-white/60'
                    )}
                    style={current === type ? {
                      background: `${COLORS[type]}20`,
                      borderColor: `${COLORS[type]}40`,
                      color: COLORS[type],
                    } : {}}
                  >
                    {type === 'optional-cardio' ? 'Cardio' : type}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

// ── Custom foods tab ───────────────────────────────────────────────────────
function FoodsTab() {
  const { customFoods, removeCustomFood } = useStore()

  if (customFoods.length === 0) {
    return (
      <div className="text-center py-16 text-white/30">
        <p>No custom foods yet.</p>
        <p className="text-sm mt-1">Add them via Nutrition &rarr; &ldquo;Teach it&rdquo;.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {customFoods.map((food) => (
        <GlassCard key={food.id} className="p-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium">{food.name}</p>
            <p className="text-white/30 text-xs">Per {food.per} • {food.kcal} kcal • P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
          </div>
          <button onClick={() => removeCustomFood(food.id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </GlassCard>
      ))}
    </div>
  )
}

// ── Data tab ───────────────────────────────────────────────────────────────
function DataTab() {
  const store = useStore()
  const [confirmWipe, setConfirmWipe] = useState('')
  const [wiped, setWiped] = useState(false)

  function exportData() {
    const data = {
      version: store.version,
      settings: store.settings,
      goals: store.goals,
      weeklyGoals: store.weeklyGoals,
      history: store.history,
      weeklyHistory: store.weeklyHistory,
      lifts: store.lifts,
      liftSets: store.liftSets,
      bodyweight: store.bodyweight,
      meals: store.meals,
      customFoods: store.customFoods,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-os-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          store.importData(data)
          alert('Data imported successfully!')
        } catch {
          alert('Invalid file format.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  function wipeData() {
    if (confirmWipe !== 'WIPE') return
    store.resetAll()
    setWiped(true)
    setConfirmWipe('')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <NeonButton color="#00E5FF" variant="outline" className="flex-1" onClick={exportData}>
          <Download className="w-4 h-4" /> Export JSON
        </NeonButton>
        <NeonButton color="#C026FF" variant="outline" className="flex-1" onClick={importData}>
          <Upload className="w-4 h-4" /> Import JSON
        </NeonButton>
      </div>

      <GlassCard glow="#FF2D87" className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm font-semibold">Danger Zone</p>
        </div>
        <p className="text-white/40 text-xs">Type WIPE to confirm erasing all data.</p>
        <div className="flex gap-2">
          <NeonInput
            value={confirmWipe}
            onChange={(e) => setConfirmWipe(e.target.value)}
            placeholder="Type WIPE"
            accentColor="#FF2D87"
            className="flex-1"
          />
          <NeonButton color="#FF2D87" onClick={wipeData} disabled={confirmWipe !== 'WIPE'}>
            Wipe
          </NeonButton>
        </div>
        {wiped && <p className="text-[#C6FF3D] text-sm">Data wiped. Defaults restored.</p>}
      </GlassCard>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('Goals')

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <PageHeader title="Settings" subtitle="Customise your Life OS" />

        {/* Tabs — scrollable */}
        <div className="flex gap-1 overflow-x-auto hide-scrollbar bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition-all',
                tab === t ? 'bg-[#FF2D87] text-white' : 'text-white/40 hover:text-white/70'
              )}
              style={tab === t ? { boxShadow: '0 0 12px rgba(255,45,135,0.4)' } : {}}>
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'Goals' && <GoalsTab />}
            {tab === 'Profile' && <ProfileTab />}
            {tab === 'Targets' && <TargetsTab />}
            {tab === 'Schedule' && <ScheduleTab />}
            {tab === 'Foods' && <FoodsTab />}
            {tab === 'Data' && <DataTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
