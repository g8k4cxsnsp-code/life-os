'use client'

import { cn } from '@/lib/cn'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface NeonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  accentColor?: string
  label?: string
  error?: string
}

export const NeonInput = forwardRef<HTMLInputElement, NeonInputProps>(
  ({ className, accentColor = '#FF2D87', label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm',
            'focus:outline-none transition-all duration-200',
            'focus:bg-white/[0.06]',
            error && 'border-red-500/40',
            className
          )}
          style={{
            ['--accent' as string]: accentColor,
          } as React.CSSProperties}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = accentColor + '60'
            e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = ''
            e.currentTarget.style.boxShadow = ''
          }}
          {...props}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    )
  }
)

NeonInput.displayName = 'NeonInput'
