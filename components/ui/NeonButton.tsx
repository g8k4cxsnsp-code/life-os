'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, color = '#FF2D87', variant = 'solid', size = 'md', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-200 select-none',
          size === 'sm' && 'text-xs px-3 py-1.5',
          size === 'md' && 'text-sm px-5 py-2.5',
          size === 'lg' && 'text-base px-7 py-3.5',
          variant === 'solid' && 'text-white',
          variant === 'outline' && 'bg-transparent text-white border',
          variant === 'ghost' && 'bg-transparent',
          className
        )}
        style={{
          ...(variant === 'solid' ? {
            background: `linear-gradient(135deg, ${color}dd, ${color}99)`,
            boxShadow: `0 0 20px ${color}44, 0 0 0 1px ${color}33`,
          } : {}),
          ...(variant === 'outline' ? {
            borderColor: `${color}60`,
            color,
            boxShadow: `0 0 12px ${color}22`,
          } : {}),
          ...(variant === 'ghost' ? { color } : {}),
        }}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {children}
      </motion.button>
    )
  }
)

NeonButton.displayName = 'NeonButton'
