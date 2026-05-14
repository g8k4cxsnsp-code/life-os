import { cn } from '@/lib/cn'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  glow?: string  // hex color for glow e.g. '#FF2D87'
  hover?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow, hover = false, children, style, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -2 } : undefined}
        className={cn('glass-card rounded-2xl', className)}
        style={{
          ...(glow ? {
            boxShadow: `0 0 0 1px ${glow}22, 0 8px 40px ${glow}14, 0 1px 0 0 rgba(255,255,255,0.06) inset`,
          } : {}),
          ...style,
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
