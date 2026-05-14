'use client'

import { useEffect } from 'react'

/** Top-level App Router error boundary. Catches runtime crashes (e.g. a stale
 *  localStorage payload that survives the persist `merge`) and gives the user
 *  an escape hatch instead of a blank black screen. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface in prod logs for debugging via Vercel runtime logs.
    console.error('[Life OS] runtime error:', error)
  }, [error])

  const resetData = () => {
    try {
      localStorage.removeItem('life-os:v1')
    } catch {}
    if (typeof window !== 'undefined') window.location.reload()
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 bg-black text-white">
      <div className="max-w-sm w-full text-center space-y-6">
        <div
          className="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: 'rgba(255,45,135,0.08)',
            border: '1px solid rgba(255,45,135,0.3)',
            boxShadow: '0 0 40px rgba(255,45,135,0.25)',
          }}
        >
          ⚡️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black">Something glitched.</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Life OS hit an unexpected error. Try again — or reset your local data if it keeps happening.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-3 rounded-2xl font-semibold text-black transition-transform active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FF2D87, #C026FF)',
              boxShadow: '0 0 24px rgba(255,45,135,0.4)',
            }}
          >
            Try again
          </button>
          <button
            onClick={resetData}
            className="w-full py-3 rounded-2xl font-semibold text-white/80 border border-white/15 hover:border-white/30 transition-colors"
          >
            Reset app data
          </button>
        </div>
        {error?.digest && (
          <p className="text-white/20 text-xs font-mono pt-2">id: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
