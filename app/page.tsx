"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CircleDollarSign, FileText, Rocket, ShieldCheck, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="space-y-8">
      <section className="bg-gradient-to-br from-slate-50 to-brand-var/20">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Instant liquidity for export invoices — 100% on Hedera.
              </h1>
              <p className="text-muted-foreground mt-2">
                Fund SMEs from $10 with on-chain proof, real-time audit, and automatic settlement.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/create">
                  <Button className="btn-brand">List your first invoice (stake HBAR)</Button>
                </Link>
                <Link href="/market">
                  <Button variant="outline">Invest from $10</Button>
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">HTS</Badge>
                <Badge variant="secondary">HCS</Badge>
                <Badge variant="secondary">File Service</Badge>
                <Badge variant="secondary">Smart Contracts</Badge>
                <Badge variant="secondary">HBAR Bond</Badge>
              </div>
            </div>
            <div className="grid gap-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-brand-var" /> How it works
                  </CardTitle>
                  <CardDescription>Upload & Verify → Tokenize → Fund → Settle</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div>• Upload & Verify — docs to File Service; hash + event to HCS.</div>
                  <div>• Tokenize — NFT (invoice) + FT (fractions) via HTS.</div>
                  <div>• Fund — investor from $10; exporter advance 80–90%.</div>
                  <div>• Settle — buyer pays, contract auto-payout; burn/archive.</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-var" /> Value props
                  </CardTitle>
                  <CardDescription>Predictable fees, compliance, and protection</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div>• Finality in seconds, predictable fee schedule.</div>
                  <div>• KYC & HTS transfer controls for RWA compliance.</div>
                  <div>• HBAR Bond + Insurance Pool quality & protection.</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <h2 className="text-xl font-semibold mb-3">Marketplace teaser</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Exporter — INV-{1000 + i}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700">Low risk</Badge>
                  <span className="text-xs">Funded 40%</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="mb-2">45d • Yield 2.5% • Bond 600 HBAR</div>
                <Link href="/market">
                  <Button variant="secondary" className="w-full">
                    Browse marketplace
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <h2 className="text-xl font-semibold mb-3">FAQ</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Do I need HBAR?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              Yes. Listings require an HBAR bond that is refunded on success.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fees</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              Each HTS transfer auto-charges a small fee in HBAR to treasury/insurance.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit trail</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              All key events are published to HCS for a real-time, immutable log.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Rocket className="h-4 w-4" /> Start listing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">Create your first invoice and stake the bond.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4" /> Invest
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">Invest from $10 and track real-time events.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Learn
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">Understand how HTS/HCS/File Service work together.</CardContent>
          </Card>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/create">
            <Button className="btn-brand">List invoice</Button>
          </Link>
          <Link href="/market">
            <Button variant="outline">Browse marketplace</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
