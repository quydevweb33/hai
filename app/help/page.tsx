"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Product promise</CardTitle>
          <CardDescription>One sentence</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          CashHash: marketplace pendanaan invoice ekspor–impor 100% native Hedera—stake HBAR untuk listing, bukti
          on-chain realtime, settlement otomatis.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trust & tech</CardTitle>
          <CardDescription>Hedera-native</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">HTS</Badge>
          <Badge variant="secondary">HCS</Badge>
          <Badge variant="secondary">File Service</Badge>
          <Badge variant="secondary">Smart Contracts</Badge>
          <Badge variant="secondary">HBAR Bond</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>Ringkas</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            <b>Risiko?</b> RWA memiliki risiko pembayaran. Guardrail: buyer ACK, dokumen terverifikasi, bond/slashing,
            Insurance Pool.
          </div>
          <div>
            <b>Fee?</b> Setiap transfer HTS auto-memotong fee kecil dalam HBAR ke treasury/insurance/community.
          </div>
          <div>
            <b>Bond?</b> Stake HBAR untuk listing. Refund saat sukses; slashing saat fraud/default.
          </div>
          <div>
            <b>KYC?</b> Exporter & attester wajib KYC/KYB. Hash & timestamp di File Service + HCS.
          </div>
          <div>
            <b>Legal?</b> SPV true sale atau assignment + notice; kontrol HTS bantu compliance region-by-region.
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
