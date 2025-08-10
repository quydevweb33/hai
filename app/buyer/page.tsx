"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { track } from "@/lib/analytics"

export default function BuyerAckPage() {
  const [invoiceId, setInvoiceId] = useState("")

  const ack = async () => {
    if (!invoiceId) return
    await fetch("/api/buyer/ack", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ invoiceId, byAccountId: "0.0.77777" }),
    })
    await track("buyer_ack", { invoiceId })
    alert("Acknowledged.")
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Buyer Acknowledgement</CardTitle>
          <CardDescription>Confirm invoice reception &amp; terms</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 grid gap-2">
            <label className="text-sm font-medium">Invoice ID</label>
            <Input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="INV-XXXX" />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={ack} disabled={!invoiceId}>
              Acknowledge
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
