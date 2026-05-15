'use client'

import { useEffect } from 'react'
import { initSync } from '@/lib/sync/syncManager'
import { getStoredPasscode } from '@/lib/sync/cloud'
import { initSupabaseSync } from '@/lib/sync/supabaseSync'

export function SyncProvider() {
  useEffect(() => {
    // Always run Supabase sync (primary, database-backed)
    initSupabaseSync()

    // Keep legacy Gist sync running if passcode is configured
    const passcode = getStoredPasscode()
    if (passcode) {
      initSync()
    }

    const retry = () => {
      initSupabaseSync()
      if (getStoredPasscode()) initSync()
    }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [])

  return null
}
