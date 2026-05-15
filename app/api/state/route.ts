import { NextRequest, NextResponse } from 'next/server'

const GIST_ID = process.env.STORAGE_GIST_ID ?? ''
const GITHUB_TOKEN = process.env.STORAGE_GITHUB_TOKEN ?? ''
const GIST_API = `https://api.github.com/gists/${GIST_ID}`

async function hashPasscode(passcode: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(passcode))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function gistHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

async function readFile(filename: string): Promise<{ state: unknown; updatedAt: number } | null> {
  const res = await fetch(GIST_API, { headers: gistHeaders(), cache: 'no-store' })
  if (!res.ok) return null
  const gist = await res.json()
  const file = gist.files?.[filename]
  if (!file) return null
  // GitHub truncates large files — fetch raw_url for full content
  const raw = file.truncated
    ? await fetch(file.raw_url, { headers: gistHeaders(), cache: 'no-store' }).then((r) => r.text())
    : file.content
  try { return JSON.parse(raw) } catch { return null }
}

async function writeFile(filename: string, data: unknown): Promise<boolean> {
  const res = await fetch(GIST_API, {
    method: 'PATCH',
    headers: gistHeaders(),
    body: JSON.stringify({ files: { [filename]: { content: JSON.stringify(data) } } }),
  })
  return res.ok
}

export async function GET(req: NextRequest) {
  if (!GIST_ID || !GITHUB_TOKEN) return NextResponse.json({ error: 'storage not configured' }, { status: 503 })
  const passcode = req.headers.get('x-passcode') ?? ''
  if (passcode.length < 4) return NextResponse.json(null, { status: 400 })

  const hash = await hashPasscode(passcode)
  const data = await readFile(`state-${hash}.json`)
  return NextResponse.json(data ?? null)
}

export async function PUT(req: NextRequest) {
  if (!GIST_ID || !GITHUB_TOKEN) return NextResponse.json({ error: 'storage not configured' }, { status: 503 })
  const passcode = req.headers.get('x-passcode') ?? ''
  if (passcode.length < 4) return NextResponse.json({ error: 'passcode required' }, { status: 400 })

  let body: { state: unknown; updatedAt: number }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }) }

  const hash = await hashPasscode(passcode)
  const filename = `state-${hash}.json`

  // Last-write-wins with timestamp guard
  const existing = await readFile(filename)
  if (existing && body.updatedAt < existing.updatedAt) {
    return NextResponse.json({ error: 'stale write rejected' }, { status: 409 })
  }

  const ok = await writeFile(filename, body)
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'write failed' }, { status: 500 })
}
