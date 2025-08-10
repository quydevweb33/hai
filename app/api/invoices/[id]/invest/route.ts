import { type NextRequest, NextResponse } from "next/server"
import { investToInvoice } from "@/lib/mock-hedera"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const amount = Number(body.amount) // cents for FT with 2 decimals
  const investor = String(body.investor || "0.0.89000")
  const txMemo = String(body.txMemo || `${params.id}|INVEST`)
  const result = investToInvoice(params.id, amount, investor, txMemo)
  return NextResponse.json(result)
}
