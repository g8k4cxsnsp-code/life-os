'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, GripVertical } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Goal } from '@/types'

interface Particle {
  id: number
  x: number
  y: number
  angle: number
}

interface GoalCardProps {
  goal: Goal
  completed: boolean
  onToggle: () => void
  workoutLabel?: string
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

export function GoalCard({ goal, completed, onToggle, workoutLabel, dragHandleProps }: GoalCardProps) {
  const color = goal.color

  const displayTitle = goal.id === 'goal-workout' && workoutLabel
    ? workoutLabel
    : goal.title

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer',
        'border transition-all duration-300 overflow-hidden',
        'glass-card',
        completed ? 'opacity-70' : 'opacity-100'
      )}
      style={{
        borderColor: completed ? `${color}30` : `${color}18`,
        boxShadow: completed
          ? `0 0 0 1px ${color}25, 0 4px 20px ${color}10`
          : `0 0 0 1px ${color}10`,
      }}
      whileHover={{
        boxShadow: `0 0 0 1px ${color}40, 0 8px 30px ${color}20`,
        y: -1,
      }}
    >
      {/* Completed background sweep */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 rounded-2xl"
            style={{ background: `linear-gradient(90deg, ${color}08, transparent)` }}
          />
        )}
      </AnimatePresence>

      {/* Drag handle */}
      {dragHandleProps && (
        <button
          className="touch-none flex items-center text-white/20 hover:text-white/50 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
          {...dragHandleProps}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* Checkbox */}
      <motion.div
        animate={completed ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
        className={cn(
          'relative w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          'transition-all duration-200'
        )}
        style={{
          borderColor: completed ? color : `${color}50`,
          background: completed ? color : 'transparent',
          boxShadow: completed ? `0 0 12px ${color}80, 0 0 4px ${color}` : undefined,
        }}
      >
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check className="w-3.5 h-3.5 text-black font-bold" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-semibold transition-all duration-200',
            completed ? 'line-through text-white/40' : 'text-white'
          )}
        >
          {displayTitle}
        </p>
        {goal.targetValue && !completed && (
          <p className="text-xs mt-0.5" style={{ color: `${color}80` }}>
            Target: {goal.targetValue}{goal.unit}
          </p>
        )}
      </div>

      {/* Category dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    </motion.div>
  )
}
