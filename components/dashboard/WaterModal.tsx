'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { NeonInput } from '@/components/ui/NeonInput'
import { useStore } from '@/lib/store'

const COLOR = '#00E5FF'

const QUICK_CHIPS: { label: string; amount: number }[] = [
  { label: '+250ml', amount: 0.25 },
  { label: '+500ml', amount: 0.5 },
  { label: '+1L', amount: 1 },
  { label: '−250ml', amount: -0.25 },
]

interface WaterModalProps {
  today: string
  waterL: number
  targetL: number
  onClose: () => void
}

export function WaterModal({ today, waterL, targetL, onClose }: WaterModalProps) {
  const updateDayLog = useStore((s) => s.updateDayLog)
  const [customMl, setCustomMl] = useState('')
  const [customError, setCustomError] = useState('')

  function applyDelta(delta: number) {
    const current = useStore.getState().history[today]?.waterL ?? 0
    const next = Math.max(0, Math.round((current + delta) * 100) / 100)
    updateDayLog(today, { waterL: next })
  }

  function handleAdd() {
    const ml = parseFloat(customMl)
    if (isNaN(ml) || ml <= 0) { setCustomError('Enter a positive number'); return }
    setCustomError('')
    applyDelta(ml / 1000)
    setCustomMl('')
  }

  function handleSubtract() {
    const ml = parseFloat(customMl)
    if (isNaN(ml) || ml <= 0) { setCustomError('Enter a positive number'); return }
    setCustomError('')
    applyDelta(-(ml / 1000))
    setCustomMl('')
  }

  function handleReset() {
    updateDayLog(today, { waterL: 0 })
  }

  const pct = Math.min((waterL / targetL) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard glow={COLOR} className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💧</span>
              <span className="font-bold text-white text-base">Water Intake</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Current value + progress */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-3xl text-white">{waterL.toFixed(2)}</span>
              <span className="text-white/40 text-sm">/ {targetL}L</span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: COLOR, boxShadow: `0 0 8px ${COLOR}` }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-white/30 text-xs">{pct.toFixed(0)}% of daily target</p>
          </div>

          {/* Quick chips */}
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Quick add</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => applyDelta(chip.amount)}
                  className="py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95"
                  style={{
                    color: chip.amount < 0 ? '#FF6B6B' : COLOR,
                    borderColor: chip.amount < 0 ? '#FF6B6B40' : `${COLOR}40`,
                    background: chip.amount < 0 ? '#FF6B6B14' : `${COLOR}14`,
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <NeonInput
              accentColor={COLOR}
              label="Custom amount (ml)"
              type="number"
              min="1"
              placeholder="e.g. 330"
              value={customMl}
              onChange={(e) => { setCustomMl(e.target.value); setCustomError('') }}
              error={customError}
            />
            <div className="flex gap-2">
              <NeonButton color={COLOR} variant="solid" size="sm" className="flex-1" onClick={handleAdd}>
                Add
              </NeonButton>
              <NeonButton color={COLOR} variant="outline" size="sm" className="flex-1" onClick={handleSubtract}>
                Subtract
              </NeonButton>
            </div>
          </div>

          {/* Reset */}
          <div className="flex justify-center pt-1">
            <button
              onClick={handleReset}
              className="text-white/25 hover:text-white/50 text-xs transition-colors"
            >
              Reset to 0
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
