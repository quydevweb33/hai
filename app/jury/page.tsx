"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function JuryScriptPage() {
  const steps = [
    { title: "1) Connect wallet", desc: "Open the connect modal, pick Testnet, connect. Status shows 0.0.xxxxx." },
    {
      title: "2) Create & List",
      desc: "Go to Create, fill details, upload PO & Invoice, BOL optional, Post Bond & List.",
    },
    {
      title: "3) Marketplace invest",
      desc: "Browse an invoice and invest from $10. See funded% update + INVESTED event.",
    },
    {
      title: "4) Buyer ACK",
      desc: "Use Buyer ACK page to acknowledge an invoice. Event appears; advance rate improves.",
    },
    { title: "5) Attester milestone", desc: "In Attester Console, sign PICKUP or DELIVERED. Event appears." },
    { title: "6) Payout", desc: "Use Demo page to run payout step to close the loop. Events: PAID → PAYOUT → CLOSED." },
  ]
  return (
    <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Judge Demo Script (7 minutes)</CardTitle>
          <CardDescription>Live E2E on Hedera-native flow (simulated)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-decimal pl-5 text-sm">
            {steps.map((s) => (
              <li key={s.title} className="mb-1">
                <b>{s.title}</b> — {s.desc}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Link href="/demo">
              <Button>Run auto demo</Button>
            </Link>
            <Link href="/events">
              <Button variant="outline">Open Event Stream</Button>
            </Link>
            <Link href="/market">
              <Button variant="outline">Go to Marketplace</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
