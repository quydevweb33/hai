import { type NextRequest, NextResponse } from "next/server"
import { attesterSign } from "@/lib/mock-hedera"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const invoiceId = String(body.invoiceId)
  const type = String(body.type || "BUYER_ACK")
  const result = attesterSign(params.id, invoiceId, type)
  return NextResponse.json(result)
}
