"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>How CashHash works</CardTitle>
          <CardDescription>4 steps • 100% on Hedera</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>1. Upload & Verify — docs to File Service; hashes public; event to HCS.</div>
          <div>2. Tokenize — NFT identity + FT fractions via HTS; custom fees in HBAR.</div>
          <div>3. Fund — investors buy from $10; exporter gets 80–90% advance.</div>
          <div>4. Settle — buyer pays; contract auto‑payouts; burn/archive.</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>HBAR flywheel</CardTitle>
          <CardDescription>Bond • Slashing • Insurance Pool</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          Listings require an HBAR bond (refunded on success). Fraud/default triggers slashing to an Insurance Pool.
          Every transfer charges an HTS custom fee paid in HBAR to treasury/insurance/community.
        </CardContent>
      </Card>
    </main>
  )
}
