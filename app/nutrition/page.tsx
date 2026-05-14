'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, useTodayMeals } from '@/lib/store'
import { parseNutritionInput } from '@/lib/nutrition/parser'
import { sumMacros, getMacroPercent, formatMacro } from '@/lib/nutrition/calc'
import { toLocalDateString } from '@/lib/date'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { NeonInput } from '@/components/ui/NeonInput'
import { PageHeader } from '@/components/ui/PageHeader'
import { Trash2, AlertCircle, Check, Plus, Search } from 'lucide-react'
import type { ParsedFoodChunk, FoodItem, MealEntry } from '@/types'
import { FOODS_DB } from '@/lib/nutrition/foods'
import { cn } from '@/lib/cn'

// ── Macro ring ─────────────────────────────────────────────────────────────
function MacroRing({ label, current, target, color }: {
  label: string; current: number; target: number; color: string
}) {
  const pct = getMacroPercent(current, target)
  const size = 80
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pct / 100 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-black text-white">{Math.round(current)}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold" style={{ color }}>{label}</p>
        <p className="text-white/30 text-[10px]">/ {target}g</p>
      </div>
    </div>
  )
}

// ── Teach modal ────────────────────────────────────────────────────────────
function TeachModal({
  query,
  onSave,
  onClose,
}: {
  query: string
  onSave: (food: FoodItem) => void
  onClose: () => void
}) {
  const [name, setName] = useState(query)
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [per, setPer] = useState<'100g' | 'item'>('100g')

  function handleSave() {
    const food: FoodItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      aliases: [name.toLowerCase().trim()],
      per,
      kcal: parseFloat(kcal) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      custom: true,
    }
    onSave(food)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 40, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, scale: 0.97 }}
        className="w-full max-w-sm"
      >
        <GlassCard glow="#C026FF" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white">Teach the App</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">×</button>
          </div>
          <p className="text-white/50 text-sm">What are the macros for &ldquo;{query}&rdquo;?</p>

          <NeonInput value={name} onChange={(e) => setName(e.target.value)} label="Food name" accentColor="#C026FF" />

          <div className="flex gap-2">
            {(['100g', 'item'] as const).map((p) => (
              <button key={p} onClick={() => setPer(p)}
                className={cn('flex-1 py-2 rounded-lg text-xs font-bold border transition-all',
                  per === p ? 'bg-[#C026FF]/20 border-[#C026FF]/40 text-[#C026FF]' : 'border-white/[0.06] text-white/40')}>
                Per {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NeonInput value={kcal} onChange={(e) => setKcal(e.target.value)} label="Calories" placeholder="kcal" type="number" accentColor="#C026FF" />
            <NeonInput value={protein} onChange={(e) => setProtein(e.target.value)} label="Protein" placeholder="g" type="number" accentColor="#C026FF" />
            <NeonInput value={carbs} onChange={(e) => setCarbs(e.target.value)} label="Carbs" placeholder="g" type="number" accentColor="#C026FF" />
            <NeonInput value={fat} onChange={(e) => setFat(e.target.value)} label="Fat" placeholder="g" type="number" accentColor="#C026FF" />
          </div>

          <NeonButton color="#C026FF" className="w-full" onClick={handleSave}>
            <Check className="w-4 h-4" /> Save Food
          </NeonButton>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function NutritionPage() {
  const { settings, customFoods, addMealEntry, removeMealEntry, addCustomFood, meals } = useStore()
  const todayMeals = useTodayMeals()
  const { kcal, protein, carbs, fat } = sumMacros(todayMeals)
  const today = toLocalDateString(new Date())

  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedFoodChunk[]>([])
  const [teachQuery, setTeachQuery] = useState<string | null>(null)

  function handleParse() {
    if (!input.trim()) return
    const results = parseNutritionInput(input, customFoods)
    setParsed(results)
  }

  function handleConfirm() {
    parsed.forEach((chunk) => {
      if (chunk.kcal === 0 && !chunk.match) return  // skip unknowns
      const entry: MealEntry = {
        id: `meal-${Date.now()}-${Math.random()}`,
        date: today,
        foodId: chunk.match?.id,
        freeText: chunk.match ? undefined : chunk.raw,
        qty: chunk.qty,
        unit: chunk.unit,
        kcal: chunk.kcal,
        protein: chunk.protein,
        carbs: chunk.carbs,
        fat: chunk.fat,
        addedAt: new Date().toISOString(),
      }
      addMealEntry(entry)
    })
    setParsed([])
    setInput('')
  }

  function handleTeachSave(food: FoodItem) {
    addCustomFood(food)
    // Re-parse with new food
    const results = parseNutritionInput(input, [...customFoods, food])
    setParsed(results)
  }

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <AnimatePresence>
        {teachQuery && (
          <TeachModal
            query={teachQuery}
            onSave={handleTeachSave}
            onClose={() => setTeachQuery(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <PageHeader title="Nutrition" subtitle="Rough daily macro tracking" />

        {/* Macro summary */}
        <GlassCard glow="#C026FF" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Today&rsquo;s Total</p>
              <p className="text-3xl font-black text-white mt-1">
                {Math.round(kcal)}
                <span className="text-white/40 text-lg ml-1">/ {settings.targets.kcal} kcal</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(192,38,255,0.15)', border: '1px solid rgba(192,38,255,0.3)' }}>
              <span className="text-xl">🍽️</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #C026FF, #FF2D87)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((kcal / settings.targets.kcal) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Macro rings */}
          <div className="grid grid-cols-3 gap-4">
            <MacroRing label="Protein" current={protein} target={settings.targets.protein} color="#FF2D87" />
            <MacroRing label="Carbs" current={carbs} target={settings.targets.carbs} color="#C6FF3D" />
            <MacroRing label="Fat" current={fat} target={settings.targets.fat} color="#FFB020" />
          </div>
        </GlassCard>

        {/* Quick add */}
        <GlassCard glow="#00E5FF" className="p-4 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Add Food</p>
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'e.g. 5 bananas and 200g chicken breast'}
              rows={2}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm resize-none focus:outline-none focus:border-[#00E5FF]/40 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleParse()
                }
              }}
            />
            <NeonButton color="#00E5FF" onClick={handleParse} className="self-end">
              <Search className="w-4 h-4" />
            </NeonButton>
          </div>

          {/* Parsed results */}
          <AnimatePresence>
            {parsed.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2">
                {parsed.map((chunk, i) => {
                  const unknown = !chunk.match
                  const color = unknown ? '#FFB020' : '#00E5FF'
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                      style={{ borderColor: `${color}30`, background: `${color}08` }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          {unknown && <AlertCircle className="w-3.5 h-3.5 text-[#FFB020]" />}
                          <p className="text-white text-sm font-medium">{chunk.match?.name ?? chunk.raw}</p>
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">
                          {chunk.qty} {chunk.unit !== 'item' ? chunk.unit : '×'} •{' '}
                          {Math.round(chunk.kcal)} kcal • P:{formatMacro(chunk.protein)} C:{formatMacro(chunk.carbs)} F:{formatMacro(chunk.fat)}
                        </p>
                      </div>
                      {unknown && (
                        <button
                          onClick={() => setTeachQuery(chunk.foodQuery)}
                          className="text-[#FFB020] text-xs font-bold hover:underline whitespace-nowrap"
                        >
                          Teach it
                        </button>
                      )}
                    </div>
                  )
                })}
                <NeonButton color="#00E5FF" className="w-full" onClick={handleConfirm}>
                  <Check className="w-4 h-4" /> Add {parsed.filter((c) => c.match || c.kcal > 0).length} item{parsed.length !== 1 ? 's' : ''}
                </NeonButton>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Today's meal list */}
        {todayMeals.length > 0 && (
          <GlassCard className="p-4 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">Today&rsquo;s Log</p>
            <AnimatePresence initial={false}>
              {[...todayMeals].reverse().map((meal) => (
                <motion.div
                  key={meal.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium">
                      {meal.foodId
                        ? ([...customFoods, ...FOODS_DB] as FoodItem[]).find((f) => f.id === meal.foodId)?.name ?? meal.freeText ?? 'Food'
                        : meal.freeText ?? 'Food'
                      }
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {Math.round(meal.kcal)} kcal • P:{formatMacro(meal.protein)}g C:{formatMacro(meal.carbs)}g F:{formatMacro(meal.fat)}g
                    </p>
                  </div>
                  <button
                    onClick={() => removeMealEntry(meal.id)}
                    className="text-white/20 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
