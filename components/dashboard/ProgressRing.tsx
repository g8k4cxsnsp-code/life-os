'use client'

import { motion } from 'framer-motion'

interface ProgressRingProps {
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  percent,
  size = 160,
  strokeWidth = 10,
  color = '#FF2D87',
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{ background: color }}
      />

      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: percent / 100 }}
          transition={{ duration: 1, ease: 'easeOut', type: 'spring', stiffness: 80, damping: 18 }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-black text-4xl chrome-text leading-none"
          style={{ textShadow: `0 0 20px ${color}66` }}
        >
          {Math.round(percent)}%
        </span>
        {label && <span className="text-white/50 text-xs mt-1">{label}</span>}
        {sublabel && <span className="text-white/30 text-[10px]">{sublabel}</span>}
      </div>
    </div>
  )
}
