import { NextResponse } from "next/server"

const events: any[] = []

export async function POST(req: Request) {
  const body = await req.json()
  events.push(body)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ events: events.slice(-200) })
}
