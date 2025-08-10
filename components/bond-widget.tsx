"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Invoice = {
  id: string
  amountUSD: number
  bondHbar?: number
}

export default function BondWidget({
  invoices = [],
  onDone = async () => {},
}: {
  invoices?: Invoice[]
  onDone?: () => Promise<void> | void
}) {
  const [invoiceId, setInvoiceId] = useState<string>(invoices[0]?.id ?? "")
  const [amountHbar, setAmountHbar] = useState<number>(600)
  const [loading, setLoading] = useState(false)

  const selected = useMemo(() => invoices.find((i) => i.id === invoiceId) ?? invoices[0], [invoices, invoiceId])

  const post = async () => {
    if (!selected) return
    setLoading(true)
    await fetch("/api/bond/post", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ invoiceId: selected.id, amountHbar }),
    })
    setLoading(false)
    await onDone()
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="grid gap-2 sm:col-span-2">
          <Label>Pilih Invoice</Label>
          <Input placeholder="INV-..." value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Amount HBAR</Label>
          <Input type="number" value={amountHbar} onChange={(e) => setAmountHbar(Number(e.target.value))} />
        </div>
      </div>
      <Button onClick={post} disabled={loading || !selected} className="bg-emerald-600 hover:bg-emerald-700">
        {loading ? "Posting..." : "Post Bond"}
      </Button>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Kebijakan (ringkas)</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Default percent 1% dari invoice, base 300 HBAR, min 250 HBAR. Slashing untuk fraud/no ACK/late payment
          (tiered).
        </CardContent>
      </Card>
    </div>
  )
}
