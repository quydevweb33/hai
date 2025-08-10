import { NextResponse } from "next/server"
import { buyerAck } from "@/lib/mock-hedera"

export async function POST(req: Request) {
  const body = await req.json()
  const invoiceId = String(body.invoiceId || "")
  const byAccountId = String(body.byAccountId || "0.0.77777")
  const res = buyerAck(invoiceId, byAccountId)
  return NextResponse.json(res)
}
