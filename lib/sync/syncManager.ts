import { useStore } from '@/lib/store'
import {
  getStoredPasscode, loadCloudState, saveCloudState,
  getLocalUpdatedAt, setLocalUpdatedAt,
} from './cloud'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

type StatusCallback = (status: SyncStatus, lastSyncedAt: number | null) => void

let statusCallback: StatusCallback | null = null
let currentStatus: SyncStatus = 'idle'
let lastSyncedAt: number | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let unsubscribe: (() => void) | null = null
let hydrating = false

export function registerStatusCallback(cb: StatusCallback) {
  statusCallback = cb
}

function emit(status: SyncStatus, ts?: number) {
  currentStatus = status
  if (ts !== undefined) lastSyncedAt = ts
  statusCallback?.(currentStatus, lastSyncedAt)
}

export function getCurrentSyncStatus() {
  return { status: currentStatus, lastSyncedAt }
}

export async function initSync() {
  const passcode = getStoredPasscode()
  if (!passcode) return

  hydrating = true
  emit('syncing')

  try {
    const remote = await loadCloudState(passcode)
    const localTs = getLocalUpdatedAt()

    if (remote && remote.updatedAt > localTs) {
      // Remote is newer — hydrate store from cloud
      useStore.setState(remote.state as object)
      setLocalUpdatedAt(remote.updatedAt)
      emit('synced', remote.updatedAt)
    } else {
      emit('synced', localTs || Date.now())
    }
  } catch {
    emit(navigator.onLine ? 'error' : 'offline')
  } finally {
    hydrating = false
    startSubscription()
  }
}

function startSubscription() {
  unsubscribe?.()
  unsubscribe = useStore.subscribe((state) => {
    if (hydrating) return
    const passcode = getStoredPasscode()
    if (!passcode) return

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const updatedAt = Date.now()
      setLocalUpdatedAt(updatedAt)
      emit('syncing')
      try {
        const ok = await saveCloudState(passcode, state, updatedAt)
        emit(ok ? 'synced' : 'error', ok ? updatedAt : undefined)
      } catch {
        emit(navigator.onLine ? 'error' : 'offline')
      }
    }, 1500)
  })
}

export function stopSync() {
  unsubscribe?.()
  unsubscribe = null
  if (debounceTimer) clearTimeout(debounceTimer)
  emit('idle')
}

export async function forcePushToCloud(passcode: string): Promise<boolean> {
  const state = useStore.getState()
  const updatedAt = Date.now()
  setLocalUpdatedAt(updatedAt)
  emit('syncing')
  try {
    const ok = await saveCloudState(passcode, state, updatedAt)
    emit(ok ? 'synced' : 'error', ok ? updatedAt : undefined)
    return ok
  } catch {
    emit('error')
    return false
  }
}

export async function forceRestoreFromCloud(passcode: string): Promise<boolean> {
  emit('syncing')
  try {
    const remote = await loadCloudState(passcode)
    if (!remote) { emit('error'); return false }
    hydrating = true
    useStore.setState(remote.state as object)
    setLocalUpdatedAt(remote.updatedAt)
    emit('synced', remote.updatedAt)
    hydrating = false
    return true
  } catch {
    emit('error')
    hydrating = false
    return false
  }
}
