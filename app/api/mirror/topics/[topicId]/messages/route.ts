import { NextResponse } from "next/server"

// Public Mirror Node REST.
// Testnet: https://testnet.mirrornode.hedera.com/api/v1
const MIRROR_BASE = "https://testnet.mirrornode.hedera.com/api/v1"

export async function GET(req: Request, { params }: { params: { topicId: string } }) {
  const { searchParams } = new URL(req.url)
  const qp = searchParams.toString()
  const url = `${MIRROR_BASE}/topics/${params.topicId}/messages${qp ? `?${qp}` : ""}`
  const r = await fetch(url, { cache: "no-store" })
  const j = await r.json()
  return NextResponse.json(j)
}
