'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  subtext?: string
  color: string
  icon?: React.ReactNode
  progress?: number  // 0–100
  actionLabel?: string
  onAction?: () => void
}

export function StatCard({ label, value, unit, subtext, color, icon, progress, actionLabel, onAction }: StatCardProps) {
  return (
    <GlassCard glow={color} hover className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${color}20` }}>
            <span style={{ color }} className="text-sm">{icon}</span>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-black text-2xl text-white leading-none">{value}</span>
        {unit && <span className="text-white/40 text-sm">{unit}</span>}
      </div>
      {subtext && <p className="text-white/30 text-xs">{subtext}</p>}
      {progress !== undefined && (
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="self-end mt-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors active:scale-95"
          style={{
            color,
            borderColor: `${color}40`,
            background: `${color}14`,
          }}
        >
          {actionLabel}
        </button>
      )}
    </GlassCard>
  )
}
