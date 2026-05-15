import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

async function hashPasscode(passcode: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(passcode))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function kvKey(hash: string) {
  return `life-os:state:${hash}`
}

export async function GET(req: NextRequest) {
  const passcode = req.headers.get('x-passcode') ?? ''
  if (passcode.length < 4) return NextResponse.json(null, { status: 400 })

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'KV not configured' }, { status: 503 })

  const hash = await hashPasscode(passcode)
  const data = await redis.get<{ state: unknown; updatedAt: number }>(kvKey(hash))
  return NextResponse.json(data ?? null)
}

export async function PUT(req: NextRequest) {
  const passcode = req.headers.get('x-passcode') ?? ''
  if (passcode.length < 4) return NextResponse.json({ error: 'passcode required' }, { status: 400 })

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'KV not configured' }, { status: 503 })

  let body: { state: unknown; updatedAt: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const hash = await hashPasscode(passcode)
  const key = kvKey(hash)

  // Last-write-wins: only reject if incoming is older than stored
  const existing = await redis.get<{ updatedAt: number }>(key)
  if (existing && body.updatedAt < existing.updatedAt) {
    return NextResponse.json({ error: 'stale write rejected' }, { status: 409 })
  }

  await redis.set(key, body)
  return NextResponse.json({ ok: true })
}
