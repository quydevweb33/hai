import { NextResponse } from "next/server"
import { getEvents } from "@/lib/mock-hedera"

export async function GET() {
  const events = getEvents()
  return NextResponse.json({ events })
}
