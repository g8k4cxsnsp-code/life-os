'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { getDailyQuote } from '@/lib/quotes'
import { Quote } from 'lucide-react'
import { useMounted } from '@/lib/useMounted'

export function QuoteCard() {
  const mounted = useMounted()
  // Quote rotation is date-derived → defer to client to avoid SSR/CSR drift.
  const quote = mounted ? getDailyQuote() : { text: '', author: '' }

  return (
    <GlassCard glow="#C026FF" className="p-5 relative overflow-hidden">
      {/* BG gradient */}
      <div className="absolute inset-0 opacity-5"
        style={{ background: 'radial-gradient(ellipse at top left, #C026FF, transparent 70%)' }} />

      <div className="relative">
        <Quote className="w-5 h-5 text-[#C026FF] mb-3 opacity-60" />
        <p className="text-white/90 text-sm font-medium leading-relaxed italic">&ldquo;{quote.text}&rdquo;</p>
        <p className="text-[#C026FF]/70 text-xs mt-3 font-semibold">— {quote.author}</p>
      </div>
    </GlassCard>
  )
}
