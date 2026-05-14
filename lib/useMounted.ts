'use client'

import { useEffect, useState } from 'react'

/** Returns true after the first client-side render. Use to gate time- or
 *  storage-dependent UI so SSR markup stays static and hydration matches. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
