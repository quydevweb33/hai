import { type NextRequest, NextResponse } from "next/server"
import { postBond } from "@/lib/mock-hedera"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const invoiceId = String(body.invoiceId)
  const amountHbar = Number(body.amountHbar)
  const result = postBond(invoiceId, amountHbar)
  return NextResponse.json(result)
}
