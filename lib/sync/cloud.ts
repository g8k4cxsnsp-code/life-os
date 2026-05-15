const PASSCODE_KEY = 'life-os:passcode'
const UPDATED_AT_KEY = 'life-os:updatedAt'

export function getStoredPasscode(): string | null {
  try { return localStorage.getItem(PASSCODE_KEY) } catch { return null }
}

export function storePasscode(passcode: string) {
  try { localStorage.setItem(PASSCODE_KEY, passcode) } catch {}
}

export function clearPasscode() {
  try {
    localStorage.removeItem(PASSCODE_KEY)
    localStorage.removeItem(UPDATED_AT_KEY)
  } catch {}
}

export function getLocalUpdatedAt(): number {
  try { return parseInt(localStorage.getItem(UPDATED_AT_KEY) ?? '0', 10) || 0 } catch { return 0 }
}

export function setLocalUpdatedAt(ts: number) {
  try { localStorage.setItem(UPDATED_AT_KEY, String(ts)) } catch {}
}

export async function loadCloudState(passcode: string): Promise<{ state: unknown; updatedAt: number } | null> {
  const res = await fetch('/api/state', {
    headers: { 'x-passcode': passcode },
  })
  if (!res.ok) return null
  return res.json()
}

export async function saveCloudState(passcode: string, state: unknown, updatedAt: number): Promise<boolean> {
  const res = await fetch('/api/state', {
    method: 'PUT',
    headers: { 'content-type': 'application/json', 'x-passcode': passcode },
    body: JSON.stringify({ state, updatedAt }),
  })
  return res.ok
}
