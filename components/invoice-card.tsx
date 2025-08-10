"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Coins, DollarSign, FileText } from "lucide-react"
import { track } from "@/lib/analytics"

type Invoice = {
  id: string
  buyer: string
  amountUSD: number
  maturity: string
  risk: "green" | "yellow" | "red"
  nftId: string
  ftId: string
  fileIds: string[]
  topicId: string
  status: string
  fundedUSD: number
  advanceRate: number
  bondHbar?: number
}

export default function InvoiceCard({
  invoice,
  onActionDone = async () => {},
}: {
  invoice?: Invoice
  onActionDone?: () => Promise<void> | void
}) {
  const inv: Invoice = invoice || {
    id: "INV-EX",
    buyer: "Acme",
    amountUSD: 10000,
    maturity: new Date().toISOString(),
    risk: "yellow",
    nftId: "0.0.123",
    ftId: "0.0.124",
    fileIds: ["0.0.80001"],
    topicId: "0.0.70001",
    status: "LISTED",
    fundedUSD: 0,
    advanceRate: 0.8,
    bondHbar: 600,
  }

  const [investAmount, setInvestAmount] = useState<number>(10)

  const invest = async () => {
    await track("invest_opened", { invoiceId: inv.id, amountUSD: investAmount })
    await fetch(`/api/invoices/${inv.id}/invest`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: investAmount * 100, investor: "0.0.89000", txMemo: `${inv.id}|INVEST` }),
    })
    await track("invest_confirmed", { invoiceId: inv.id, amountUSD: investAmount })
    await onActionDone()
  }

  const riskColor =
    inv.risk === "green"
      ? "bg-emerald-100 text-emerald-800"
      : inv.risk === "red"
        ? "bg-rose-100 text-rose-800"
        : "bg-amber-100 text-amber-800"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{inv.id}</CardTitle>
          <Badge className={`capitalize ${riskColor}`}>{inv.risk}</Badge>
        </div>
        <CardDescription>{inv.buyer}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">${inv.amountUSD.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Advance cap</span>
          <span className="font-medium">{Math.round(inv.advanceRate * 100)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Funded</span>
          <span className="font-medium">${inv.fundedUSD.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="outline" className="capitalize">
            {inv.status.toLowerCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" /> FS: {inv.fileIds.join(", ")} • HTS: NFT {inv.nftId}, FT {inv.ftId}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex w-full items-center gap-2">
          <Input
            type="number"
            min={10}
            step={5}
            value={investAmount}
            onChange={(e) => setInvestAmount(Number(e.target.value))}
          />
          <Button onClick={invest} className="bg-emerald-600 hover:bg-emerald-700">
            <Coins className="h-4 w-4 mr-2" /> Invest ${investAmount}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          <DollarSign className="inline h-3 w-3 mr-1" />
          Custom fee HTS in HBAR dipotong otomatis per transfer (simulasi kebijakan).
        </div>
      </CardFooter>
    </Card>
  )
}
