"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EventFeed from "@/components/event-feed"
import { CheckCircle2, Circle } from "lucide-react"
import { track } from "@/lib/analytics"

type Step = {
  key: string
  title: string
  action: () => Promise<void>
}

export default function DemoPage() {
  const [steps, setSteps] = useState<Record<string, "idle" | "doing" | "done">>({
    create: "idle",
    bond: "idle",
    invest: "idle",
    ack: "idle",
    payout: "idle",
  })
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null)

  const run = async () => {
    // Create & list
    await doStep("create", async () => {
      const fd = new FormData()
      fd.set("buyer", "Contoso Import Ltd.")
      fd.set("amountUSD", "10000")
      fd.set("maturity", new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString())
      fd.set("risk", "yellow")
      fd.set("fileNames", JSON.stringify(["invoice.pdf", "po.pdf", "bol.pdf"]))
      const res = await fetch("/api/invoices", { method: "POST", body: fd })
      const data = await res.json()
      setCreatedInvoiceId(data.invoice?.id ?? null)
    })
    // Post bond
    await doStep("bond", async () => {
      if (!createdInvoiceId) return
      await fetch("/api/bond/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ invoiceId: createdInvoiceId, amountHbar: 600 }),
      })
    })
    // Invest
    await doStep("invest", async () => {
      if (!createdInvoiceId) return
      await fetch(`/api/invoices/${createdInvoiceId}/invest`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 1000, investor: "0.0.89000", txMemo: `${createdInvoiceId}|INVEST` }),
      })
    })
    // Ack
    await doStep("ack", async () => {
      if (!createdInvoiceId) return
      await fetch(`/api/attesters/0.0.77777/sign`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ invoiceId: createdInvoiceId, type: "BUYER_ACK" }),
      })
    })
    // Payout
    await doStep("payout", async () => {
      if (!createdInvoiceId) return
      await fetch(`/api/invoices/${createdInvoiceId}/payout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ invoiceId: createdInvoiceId, buyerPaymentTxn: "0xdef...", amountPaid: 10000 }),
      })
    })
  }

  const doStep = async (key: keyof typeof steps, fn: () => Promise<void>) => {
    setSteps((s) => ({ ...s, [key]: "doing" }))
    await fn()
    try {
      const map: Record<string, string> = {
        create: "invoice_listed",
        bond: "bond_posted",
        invest: "invest_confirmed",
        ack: "buyer_ack",
        payout: "payout_received",
      }
      const ev = map[key]
      if (ev) await track(ev as any, { step: key })
    } catch {}
    setSteps((s) => ({ ...s, [key]: "done" }))
    await new Promise((r) => setTimeout(r, 800))
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl sm:text-2xl font-bold">Demo Script 7 Menit (Otomatis)</h1>
      <p className="text-muted-foreground mb-4">Create & List → Post Bond → Invest → Buyer ACK → Payout & Close</p>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
          <CardDescription>Click Run Demo untuk menjalankan alur lengkap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "create", title: "Create & List" },
            { key: "bond", title: "Post Bond (600 HBAR)" },
            { key: "invest", title: "Invest $10" },
            { key: "ack", title: "Buyer ACK" },
            { key: "payout", title: "Payout & Close" },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              {steps[s.key as keyof typeof steps] === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span>{s.title}</span>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={run} className="bg-emerald-600 hover:bg-emerald-700">
            Run Demo
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Event Feed</CardTitle>
          <CardDescription>HCS stream (simulasi)</CardDescription>
        </CardHeader>
        <CardContent>
          <EventFeed />
        </CardContent>
      </Card>
    </main>
  )
}
