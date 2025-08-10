import { type NextRequest, NextResponse } from "next/server"
import { payoutInvoice } from "@/lib/mock-hedera"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const buyerPaymentTxn = String(body.buyerPaymentTxn || "0x")
  const amountPaid = Number(body.amountPaid || 0)
  const result = payoutInvoice(params.id, amountPaid, buyerPaymentTxn)
  return NextResponse.json(result)
}
