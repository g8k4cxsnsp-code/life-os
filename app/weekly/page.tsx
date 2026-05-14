'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { getWeekStartString } from '@/lib/date'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { Check, Plus, Trophy } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useState } from 'react'
import { NeonInput } from '@/components/ui/NeonInput'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function WeeklyPage() {
  const { weeklyGoals, weeklyHistory, toggleWeeklyGoal, addWeeklyGoal } = useStore()
  const weekStart = getWeekStartString()
  const weekLog = weeklyHistory[weekStart] ?? { weekStart, completed: {} }
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const activeGoals = weeklyGoals.filter((g) => g.active)
  const allComplete = activeGoals.length > 0 && activeGoals.every(
    (g) => (weekLog.completed[g.id] ?? 0) >= g.targetCount
  )

  const COLORS = ['#FF2D87', '#00E5FF', '#C6FF3D', '#C026FF', '#7A5CFF', '#FFB020']

  function handleAdd() {
    if (!newTitle.trim()) return
    addWeeklyGoal({
      id: `weekly-${Date.now()}`,
      title: newTitle.trim(),
      color: COLORS[weeklyGoals.length % COLORS.length],
      targetCount: 1,
      active: true,
      createdAt: new Date().toISOString(),
    })
    setNewTitle('')
    setAddOpen(false)
  }

  return (
    <div className="px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <PageHeader
            title="Weekly Goals"
            subtitle="Complete anytime before Sunday 23:59"
            right={
              <NeonButton size="sm" onClick={() => setAddOpen(!addOpen)}>
                <Plus className="w-3.5 h-3.5" /> Add Goal
              </NeonButton>
            }
          />
        </motion.div>

        {/* Add form */}
        <AnimatePresence>
          {addOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <GlassCard glow="#FF2D87" className="p-4 flex gap-3">
                <NeonInput
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cold shower"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  autoFocus
                />
                <NeonButton size="sm" onClick={handleAdd}>Add</NeonButton>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All complete banner */}
        <AnimatePresence>
          {allComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard glow="#C6FF3D" className="p-5 flex items-center gap-4">
                <Trophy className="w-8 h-8 text-[#C6FF3D]" style={{ filter: 'drop-shadow(0 0 8px #C6FF3D)' }} />
                <div>
                  <p className="text-[#C6FF3D] font-black text-lg">Week Complete!</p>
                  <p className="text-white/50 text-sm">You crushed every goal this week.</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal cards */}
        <motion.div variants={item} className="space-y-3">
          {activeGoals.map((goal) => {
            const count = weekLog.completed[goal.id] ?? 0
            const done = count >= goal.targetCount
            const color = goal.color

            return (
              <motion.div
                key={goal.id}
                layout
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleWeeklyGoal(goal.id, weekStart)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-2xl cursor-pointer glass-card border',
                  'transition-all duration-300'
                )}
                style={{
                  borderColor: done ? `${color}30` : `${color}18`,
                  boxShadow: done ? `0 0 0 1px ${color}25, 0 4px 20px ${color}10` : undefined,
                }}
                whileHover={{ y: -1, boxShadow: `0 0 0 1px ${color}40, 0 8px 30px ${color}20` }}
              >
                {/* Checkbox */}
                <motion.div
                  animate={done ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: done ? color : `${color}50`,
                    background: done ? color : 'transparent',
                    boxShadow: done ? `0 0 12px ${color}80` : undefined,
                  }}
                >
                  <AnimatePresence>
                    {done && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check className="w-4 h-4 text-black" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="flex-1">
                  <p className={cn('font-semibold text-sm transition-all', done ? 'line-through text-white/40' : 'text-white')}>
                    {goal.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: `${color}80` }}>
                    {count} / {goal.targetCount} time{goal.targetCount > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Progress pill */}
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: done ? `${color}20` : 'rgba(255,255,255,0.04)',
                    color: done ? color : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${done ? color + '40' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {done ? '✓ Done' : 'Pending'}
                </div>
              </motion.div>
            )
          })}

          {activeGoals.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <p className="text-lg">No weekly goals yet.</p>
              <p className="text-sm mt-1">Add your first goal above.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
