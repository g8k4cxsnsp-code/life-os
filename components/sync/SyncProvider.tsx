'use client'

import { useEffect } from 'react'
import { initSync } from '@/lib/sync/syncManager'
import { getStoredPasscode } from '@/lib/sync/cloud'

export function SyncProvider() {
  useEffect(() => {
    const passcode = getStoredPasscode()
    if (passcode) {
      initSync()
    }
    // Listen for online/offline to retry
    const retry = () => { if (getStoredPasscode()) initSync() }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [])

  return null
}
