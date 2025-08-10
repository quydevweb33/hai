import { NextResponse } from "next/server"
import { registerAttester } from "@/lib/mock-hedera"

export async function POST(req: Request) {
  const body = await req.json()
  const orgName = String(body.orgName || "Unknown Org")
  const contact = String(body.contact || "")
  const bondHbar = Number(body.bondHbar || 0)
  const res = registerAttester({ orgName, contact, bondHbar })
  return NextResponse.json(res)
}
