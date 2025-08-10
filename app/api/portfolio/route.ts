import { type NextRequest, NextResponse } from "next/server"
import { getPortfolio } from "@/lib/mock-hedera"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const account = searchParams.get("account") || "0.0.22222"
  const portfolio = getPortfolio(account)
  return NextResponse.json({ portfolio })
}
