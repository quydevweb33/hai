import { NextResponse } from "next/server"

// In-memory encrypted blob store for demo.
// value: { name, mime, size, iv, data, createdAt }
const store: Map<string, any> = (globalThis as any).__CASHHASH_FILES__ ?? new Map<string, any>()
;(globalThis as any).__CASHHASH_FILES__ = store

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, mime, size, iv, data } = body || {}
    if (!name || !iv || !data) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })
    }
    // Basic size guard (base64): ~13.3MB limit for demo
    if (String(data).length > 18_000_000) {
      return NextResponse.json({ ok: false, error: "File too large for demo" }, { status: 413 })
    }
    const id = Math.random().toString(36).slice(2, 8).toUpperCase()
    const fsName = `enc-${id}.bin`
    store.set(fsName, { name, mime, size, iv, data, createdAt: new Date().toISOString() })
    return NextResponse.json({ ok: true, fsName })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Upload error" }, { status: 500 })
  }
}

export async function GET() {
  // non-sensitive listing (names only) for demo visibility
  const list = Array.from(store.keys())
  return NextResponse.json({ ok: true, files: list })
}
