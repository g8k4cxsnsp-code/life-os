'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, useTodayMeals } from '@/lib/store'
import { parseNutritionInput, searchFoods, computeMacrosFor } from '@/lib/nutrition/parser'
import { sumMacros, getMacroPercent, formatMacro } from '@/lib/nutrition/calc'
import { toLocalDateString } from '@/lib/date'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { NeonInput } from '@/components/ui/NeonInput'
import { PageHeader } from '@/components/ui/PageHeader'
import { Trash2, AlertCircle, Check, Plus, Search, BookOpen, X } from 'lucide-react'
import type { ParsedFoodChunk, FoodItem, MealEntry } from '@/types'
import { FOODS_DB } from '@/lib/nutrition/foods'
import { cn } from '@/lib/cn'
import { buildNudges } from '@/lib/nutrition/recommendations'
import { useGoalBias, useTodayLog } from '@/lib/store'

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
  const [defaultQtyStr, setDefaultQtyStr] = useState('')
  const [aliasesStr, setAliasesStr] = useState(query ? query.toLowerCase().trim() : '')

  const kcalVal = parseFloat(kcal) || 0
  const proteinVal = parseFloat(protein) || 0
  const carbsVal = parseFloat(carbs) || 0
  const fatVal = parseFloat(fat) || 0
  const hasPreview = kcalVal > 0 || proteinVal > 0 || carbsVal > 0 || fatVal > 0

  function handleSave() {
    const rawAliases = aliasesStr.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean)
    const nameAlias = name.toLowerCase().trim()
    const aliases = Array.from(new Set([nameAlias, ...rawAliases]))
    const food: FoodItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      aliases,
      per,
      kcal: kcalVal,
      protein: proteinVal,
      carbs: carbsVal,
      fat: fatVal,
      defaultQty: per === 'item' && defaultQtyStr ? parseFloat(defaultQtyStr) || undefined : undefined,
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
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-lg leading-none">×</button>
          </div>
          <p className="text-white/50 text-sm">What are the macros for <span className="text-[#C026FF] font-semibold">&ldquo;{query}&rdquo;</span>?</p>

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

          {per === 'item' && (
            <NeonInput
              value={defaultQtyStr}
              onChange={(e) => setDefaultQtyStr(e.target.value)}
              label="Serving weight (g) — optional"
              placeholder="e.g. 118 for a medium banana"
              type="number"
              accentColor="#C026FF"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <NeonInput value={kcal} onChange={(e) => setKcal(e.target.value)} label="Calories" placeholder="kcal" type="number" accentColor="#C026FF" />
            <NeonInput value={protein} onChange={(e) => setProtein(e.target.value)} label="Protein" placeholder="g" type="number" accentColor="#C026FF" />
            <NeonInput value={carbs} onChange={(e) => setCarbs(e.target.value)} label="Carbs" placeholder="g" type="number" accentColor="#C026FF" />
            <NeonInput value={fat} onChange={(e) => setFat(e.target.value)} label="Fat" placeholder="g" type="number" accentColor="#C026FF" />
          </div>

          <div>
            <NeonInput
              value={aliasesStr}
              onChange={(e) => setAliasesStr(e.target.value)}
              label="Aliases (comma-separated)"
              placeholder="e.g. protein powder, whey, shake"
              accentColor="#C026FF"
            />
            <p className="text-white/30 text-[10px] mt-1">These alternate names will also match in search.</p>
          </div>

          {hasPreview && (
            <div className="rounded-lg px-3 py-2 text-xs text-white/50" style={{ background: 'rgba(192,38,255,0.06)', border: '1px solid rgba(192,38,255,0.15)' }}>
              {per === '100g' ? '100g' : '1 serving'} = <span className="text-white/80">{kcalVal} kcal</span>
              {' · '}P <span className="text-[#FF2D87]">{proteinVal}g</span>
              {' · '}C <span className="text-[#C6FF3D]">{carbsVal}g</span>
              {' · '}F <span className="text-[#FFB020]">{fatVal}g</span>
            </div>
          )}

          <NeonButton color="#C026FF" className="w-full" onClick={handleSave} disabled={!name.trim()}>
            <Check className="w-4 h-4" /> Teach the App
          </NeonButton>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
import { DEFAULT_SETTINGS } from '@/lib/store/defaults'

export default function NutritionPage() {
  const { settings, customFoods: customFoodsRaw, addMealEntry, removeMealEntry, addCustomFood, dismissNudge, meals } = useStore()
  const todayMealsRaw = useTodayMeals()
  const todayLog = useTodayLog()
  const goalBias = useGoalBias()
  const todayMeals = Array.isArray(todayMealsRaw) ? todayMealsRaw : []
  const customFoods = Array.isArray(customFoodsRaw) ? customFoodsRaw : []
  const targets = settings?.targets ?? DEFAULT_SETTINGS.targets
  const { kcal, protein, carbs, fat } = sumMacros(todayMeals)
  const today = toLocalDateString(new Date())

  const dismissed = todayLog.dismissedNudges ?? []
  const hour = new Date().getHours()
  const waterL = todayLog.waterL ?? 0
  const nudges = buildNudges({
    totals: { kcal, protein, carbs, fat },
    targets,
    bias: goalBias,
    hourOfDay: hour,
    waterL,
    waterTarget: targets.waterL,
  }).filter((n) => !dismissed.includes(n.id))

  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedFoodChunk[]>([])
  const [teachQuery, setTeachQuery] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [selectedQty, setSelectedQty] = useState<string>('1')

  const searchResults = search.trim().length > 0 ? searchFoods(search, customFoods, 12) : []

  function pickFood(food: FoodItem) {
    setSelected(food)
    setSelectedQty(food.per === 'item' ? '1' : '100')
    setSearch('')
  }

  function addSelected() {
    if (!selected) return
    const qty = parseFloat(selectedQty)
    if (!qty || qty <= 0) return
    const unit: 'item' | 'g' | 'ml' = selected.per === 'item' ? 'item' : selected.per === '100ml' ? 'ml' : 'g'
    const macros = computeMacrosFor(qty, unit, selected)
    const entry: MealEntry = {
      id: `meal-${Date.now()}-${Math.random()}`,
      date: today,
      foodId: selected.id,
      qty,
      unit,
      kcal: macros.kcal,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      addedAt: new Date().toISOString(),
    }
    addMealEntry(entry)
    setSelected(null)
    setSelectedQty('1')
  }

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
                <span className="text-white/40 text-lg ml-1">/ {targets.kcal} kcal</span>
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
              animate={{ width: `${Math.min((kcal / (targets.kcal || 1)) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Macro rings */}
          <div className="grid grid-cols-3 gap-4">
            <MacroRing label="Protein" current={protein} target={targets.protein} color="#FF2D87" />
            <MacroRing label="Carbs" current={carbs} target={targets.carbs} color="#C6FF3D" />
            <MacroRing label="Fat" current={fat} target={targets.fat} color="#FFB020" />
          </div>
        </GlassCard>

        {/* Nudge strip */}
        <AnimatePresence>
          {nudges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
            >
              {nudges.map((nudge, i) => {
                const color = nudge.tone === 'warn' ? '#FFB020' : nudge.tone === 'good' ? '#C6FF3D' : '#00E5FF'
                return (
                  <motion.div
                    key={nudge.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2 flex-shrink-0 max-w-[280px] rounded-xl px-3 py-2.5 text-xs"
                    style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                  >
                    <span className="mt-0.5 flex-shrink-0" style={{ color }}>{nudge.tone === 'warn' ? '⚠' : nudge.tone === 'good' ? '✓' : 'ℹ'}</span>
                    <span className="text-white/80 leading-relaxed">{nudge.text}</span>
                    <button
                      onClick={() => dismissNudge(today, nudge.id)}
                      className="ml-1 flex-shrink-0 text-white/20 hover:text-white/60 transition-colors mt-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search foods (MFP-style autocomplete) */}
        <GlassCard glow="#C6FF3D" className="p-4 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Search Foods</p>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. chicken mayo sandwich, big mac…"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#C6FF3D]/40 transition-all"
            />
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && !selected && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {searchResults.map(({ food, confidence }) => (
                  <button
                    key={food.id}
                    onClick={() => pickFood(food)}
                    className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{food.name}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {Math.round(food.kcal)} kcal {food.per === 'item' ? '/ serving' : `/ ${food.per === '100ml' ? '100ml' : '100g'}`}
                        {' · '}P {food.protein}g · C {food.carbs}g · F {food.fat}g
                      </p>
                    </div>
                    <span className="text-white/20 text-xs">{Math.round(confidence * 100)}%</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No match — teach prompt */}
          <AnimatePresence>
            {search.trim().length > 1 && searchResults.length === 0 && !selected && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(192,38,255,0.06)', border: '1px solid rgba(192,38,255,0.2)' }}
              >
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <BookOpen className="w-4 h-4 text-[#C026FF]" />
                  <span>No match for <span className="text-white/70 font-medium">&ldquo;{search}&rdquo;</span></span>
                </div>
                <button
                  onClick={() => setTeachQuery(search.trim())}
                  className="text-[#C026FF] text-xs font-bold hover:text-[#C026FF]/80 transition-colors whitespace-nowrap ml-3"
                >
                  Teach the app →
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-xl p-3 space-y-3" style={{ border: '1px solid rgba(198,255,61,0.2)', background: 'rgba(198,255,61,0.05)' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-white font-medium">{selected.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {selected.per === 'item' ? `${selected.kcal} kcal / serving` : `${selected.kcal} kcal / ${selected.per === '100ml' ? '100ml' : '100g'}`}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-sm">×</button>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-white/30 text-[10px] uppercase tracking-wider">
                      {selected.per === 'item' ? 'Servings' : selected.per === '100ml' ? 'ml' : 'grams'}
                    </label>
                    <input
                      type="number"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(e.target.value)}
                      step={selected.per === 'item' ? '0.5' : '10'}
                      min="0"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C6FF3D]/40"
                    />
                  </div>
                  <NeonButton color="#C6FF3D" onClick={addSelected}>
                    <Plus className="w-4 h-4" /> Add
                  </NeonButton>
                </div>
                {(() => {
                  const qty = parseFloat(selectedQty) || 0
                  const unit: 'item' | 'g' | 'ml' = selected.per === 'item' ? 'item' : selected.per === '100ml' ? 'ml' : 'g'
                  const m = computeMacrosFor(qty, unit, selected)
                  return (
                    <p className="text-white/50 text-xs">
                      = {m.kcal} kcal · P {m.protein}g · C {m.carbs}g · F {m.fat}g
                    </p>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Quick add */}
        <GlassCard glow="#00E5FF" className="p-4 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Free-text Add</p>
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
