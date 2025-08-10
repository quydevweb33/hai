"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { track } from "@/lib/analytics"

type Invoice = { id: string; buyer: string; status: string }

export default function AttesterPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoiceId, setInvoiceId] = useState<string>("")
  const [attesterId, setAttesterId] = useState<string>("0.0.77777")
  const [type, setType] = useState<"BUYER_ACK" | "PICKUP">("BUYER_ACK")
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    const res = await fetch("/api/invoices", { cache: "no-store" })
    const data = await res.json()
    setInvoices((data.invoices ?? []).map((i: any) => ({ id: i.id, buyer: i.buyer, status: i.status })))
  }

  useEffect(() => {
    refresh()
  }, [])

  const sign = async () => {
    if (!invoiceId) return
    setLoading(true)
    await fetch(`/api/attesters/${attesterId}/sign`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ invoiceId, type }),
    })
    await track("milestone_signed", { invoiceId, attesterId, type })
    setLoading(false)
    await refresh()
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Attester Console</CardTitle>
          <CardDescription>Sign milestones & buyer acknowledgements</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Invoice</label>
            <Select value={invoiceId} onValueChange={setInvoiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.id} — {i.buyer} ({i.status.toLowerCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Attester Account</label>
            <Input value={attesterId} onChange={(e) => setAttesterId(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Milestone</label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUYER_ACK">BUYER_ACK</SelectItem>
                <SelectItem value="PICKUP">PICKUP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={sign} disabled={!invoiceId || loading} className="bg-violet-600 hover:bg-violet-700">
              {loading ? "Signing..." : "Sign & Publish"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
