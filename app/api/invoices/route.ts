import { type NextRequest, NextResponse } from "next/server"
import { createInvoice, listInvoices } from "@/lib/mock-hedera"

export async function GET(req: NextRequest) {
  // owner query ignored in mock, kept for API shape
  const invoices = listInvoices()
  return NextResponse.json({ invoices })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const buyer = String(formData.get("buyer") || "Unknown Buyer")
  const amountUSD = Number(formData.get("amountUSD") || 0)
  const maturity = String(formData.get("maturity") || new Date().toISOString())
  const risk = String(formData.get("risk") || "yellow") as "green" | "yellow" | "red"
  const fileNamesStr = String(formData.get("fileNames") || "[]")
  let fileNames: string[] = []
  try {
    fileNames = JSON.parse(fileNamesStr)
  } catch {
    fileNames = []
  }
  const invoice = createInvoice({ buyer, amountUSD, maturity, risk, fileNames })
  return NextResponse.json({ invoice })
}
