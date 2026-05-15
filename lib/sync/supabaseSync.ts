import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
type StatusCallback = (status: SyncStatus, lastSyncedAt: number | null) => void

let statusCallback: StatusCallback | null = null
let currentStatus: SyncStatus = 'idle'
let lastSyncedAt: number | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let unsubscribe: (() => void) | null = null
let hydrating = false

export function registerSupabaseStatusCallback(cb: StatusCallback) {
  statusCallback = cb
}

export function getSupabaseSyncStatus() {
  return { status: currentStatus, lastSyncedAt }
}

function emit(status: SyncStatus, ts?: number) {
  currentStatus = status
  if (ts !== undefined) lastSyncedAt = ts
  statusCallback?.(currentStatus, lastSyncedAt)
}

export async function initSupabaseSync() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  hydrating = true
  emit('syncing')

  try {
    const { data } = await supabase
      .from('user_data')
      .select('payload, updated_at')
      .eq('user_id', user.id)
      .single()

    if (data?.payload) {
      const remoteTs = new Date(data.updated_at).getTime()
      // Use localStorage timestamp as proxy for local freshness
      const localTsStr = typeof window !== 'undefined' ? localStorage.getItem('life-os:updatedAt') : null
      const localTs = localTsStr ? parseInt(localTsStr, 10) : 0
      if (remoteTs > localTs) {
        useStore.setState(data.payload as object)
        localStorage.setItem('life-os:updatedAt', String(remoteTs))
      }
      emit('synced', remoteTs)
    } else {
      // First login — push local data up
      await pushToSupabase(user.id)
    }
  } catch {
    emit(navigator.onLine ? 'error' : 'offline')
  } finally {
    hydrating = false
    startSupabaseSubscription(user.id)
  }
}

function startSupabaseSubscription(userId: string) {
  unsubscribe?.()
  unsubscribe = useStore.subscribe(() => {
    if (hydrating) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => pushToSupabase(userId), 1500)
  })
}

async function pushToSupabase(userId: string) {
  const supabase = createClient()
  const state = useStore.getState()
  const updatedAt = new Date().toISOString()
  emit('syncing')
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({ user_id: userId, payload: state, updated_at: updatedAt }, { onConflict: 'user_id' })
    if (error) throw error
    emit('synced', Date.now())
  } catch {
    emit(navigator.onLine ? 'error' : 'offline')
  }
}

export function stopSupabaseSync() {
  unsubscribe?.()
  unsubscribe = null
  if (debounceTimer) clearTimeout(debounceTimer)
  emit('idle')
}

export async function forcePushSupabase(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  await pushToSupabase(user.id)
  return currentStatus === 'synced'
}

export async function forceRestoreSupabase(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  emit('syncing')
  try {
    const { data } = await supabase
      .from('user_data')
      .select('payload, updated_at')
      .eq('user_id', user.id)
      .single()
    if (!data?.payload) { emit('error'); return false }
    hydrating = true
    useStore.setState(data.payload as object)
    emit('synced', new Date(data.updated_at).getTime())
    hydrating = false
    return true
  } catch {
    emit('error')
    hydrating = false
    return false
  }
}
