'use client'

import { motion } from 'framer-motion'
import { Moon, Droplets } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

export function RecoveryDay() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Halo */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(122,92,255,0.08)',
            border: '1px solid rgba(122,92,255,0.2)',
            boxShadow: '0 0 60px rgba(122,92,255,0.2)',
          }}>
          <Moon className="w-14 h-14 text-[#7A5CFF]" style={{ filter: 'drop-shadow(0 0 12px #7A5CFF)' }} />
        </div>
        {/* Orbiting particle */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7A5CFF]"
            style={{ boxShadow: '0 0 8px #7A5CFF' }} />
        </motion.div>
      </div>

      <h2 className="text-3xl font-black text-white mb-2">Recovery Day</h2>
      <p className="text-white/50 text-base max-w-xs leading-relaxed">
        Rest is part of the work.<br />Let your body rebuild.
      </p>

      <GlassCard glow="#7A5CFF" className="mt-8 p-5 max-w-xs w-full">
        <p className="text-[#7A5CFF] text-xs font-semibold uppercase tracking-wider mb-3">Sunday Essentials</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-[#7A5CFF]" />
            <span className="text-white/70 text-sm">Get 8+ hours of sleep</span>
          </div>
          <div className="flex items-center gap-3">
            <Droplets className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-white/70 text-sm">Drink 2.5L water</span>
          </div>
        </div>
      </GlassCard>

      <p className="text-white/20 text-xs mt-8 italic">Tomorrow you go again.</p>
    </motion.div>
  )
}
